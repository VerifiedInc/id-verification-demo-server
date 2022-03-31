// Application hooks that run for every service
// Don't remove this comment. It's needed to format import lines nicely.
import { HookContext } from '@feathersjs/feathers';
import { addCustomAttribute, getTraceMetadata, getTransaction, setTransactionName, startWebTransaction, TraceMetadata } from 'newrelic';

import logger from './logger';
import { pick } from 'lodash';
import { iff } from 'feathers-hooks-common';
import { isTest } from './services/hooks/isTest';
import NodeCache from 'node-cache';
import { HookContextWithTransaction } from './declarations';

/**
 * A LRU cache with an expiration of 60 seconds for use of storing transient new relic transaction ids.
 * Needed so that the transactions that are being handle manually, due no native new relic apm support for feathersjs,
 * are not effected by nested calls to services that happen as a result of a single external api call.
 */
const traceIds = new NodeCache({ stdTTL: 60 });

function logRequest (ctx: HookContext): void {
  const { path, method, id, data, params } = ctx;
  const version = params.headers?.version;
  const string = data && JSON.stringify(data);
  const length = 2000;
  const dataString = string && (string.length < length ? string : string.substring(0, length - 3) + '...');
  logger.info(`${path}#${method}${version ? ` v${version}` : ''}${id ? ` id: ${id}` : ''}${data ? ` data: ${dataString}}` : ''}`);
  // logger.debug(`params: ${JSON.stringify(params)}`); // NOTE: actually do not want todo this without obfuscating the Bearer Token or authToken in the params object.
}

function logResult (ctx: HookContext): HookContext {
  const { path, method, result } = ctx;
  const string = result && JSON.stringify(result);
  const length = 2000; // prevent exceedingly long result log messages. New relic's limit is 4000.
  const resultString = string && (string.length < length ? string : string.substring(0, length - 3) + '...');

  logger.info(`${path}#${method} result: ${resultString}`);
  return ctx;
}

function logError (ctx: HookContext): void {
  const { path, method, error } = ctx;
  const { name, code, message, stack } = error;
  const rawInfo = pick(ctx, ['params', 'id', 'data']);
  const info = { ...rawInfo, stack };

  if (info.params?.headers?.authorization) {
    info.params.headers.authorization = 'Bearer *****';
  }

  if (info.params.authToken) {
    info.params.authToken = '*****';
  }

  logger.warn(`Error in ${path}#${method}: name=${name} code=${code} message=${message} info=${JSON.stringify(info)}`);
}

/**
 * Add metadata to the New Relic transaction.
 * @param ctx
 */
function newRelicTransactionBefore (ctx: HookContextWithTransaction): void {
  startWebTransaction(`${ctx.method} ${ctx.path}`, () => {
    const metadata: TraceMetadata = getTraceMetadata();
    const traceId: string = metadata.traceId ?? '';

    // HACK ALERT: If the traceId is not present in the LRU set the transaction on the context
    // this means this is the original context of an external api call and the transaction
    // attribute will be needed in the after hook once all nested service calls completed associated with this parent one.
    // This hack solution was chosen after trying many others documented here: https://github.com/feathersjs/feathers/issues/2123
    if (!traceIds.has(traceId)) {
      traceIds.set(traceId, traceId);
      ctx.transaction = getTransaction();
    }
  });
}

/**
 * End the single external New Relic transaction.
 * @param ctx
 */
function newRelicTransactionAfter (ctx: HookContextWithTransaction): HookContext {
  if (ctx.transaction) {
    setTransactionName(`${ctx.method} ${ctx.path}`);

    addCustomAttribute('params', JSON.stringify(ctx.data));
    addCustomAttribute('result', JSON.stringify(ctx.result));

    ctx.transaction = getTransaction();
    ctx.transaction.end();
  }

  return ctx;
}

export default {
  before: {
    all: [logRequest, iff(!isTest, newRelicTransactionBefore)],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [logResult, iff(!isTest, newRelicTransactionAfter)],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [logError, iff(!isTest, newRelicTransactionAfter)],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
