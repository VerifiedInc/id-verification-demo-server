import { iff } from 'feathers-hooks-common';
import { isExternal } from '../hooks/isExternal';
import { requireAdminAuthKey } from '../hooks/requireAdminAuthKey';

export default {
  before: {
    all: [iff(isExternal, requireAdminAuthKey)],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
