# Identity Verification Demo Server
> This project acts as the backend for a fictional customer that collects information about a user during onboarding then wants to issue Unum ID credentials to them. Using the Unum ID [Wallet](https://wallet.unumid.co/) the user is in full control of sharing this information.

Information about the Unum ID demo ecosystem can be found in our [documentation](https://docs.unumid.co/#demos).

This demo specifically acts as an [Issuer](https://docs.unumid.co/terminology/#issuer) in the Unum ID ecosystem while Acme as seen in the ID Verification [Client](https://github.com/UnumID/id-verification-demo-client)'s `/request` path acts as a [Verifier](https://docs.unumid.co/terminology/#verifier). It is worth noting while this demo interfaces with our ACME verifier server demo to act as a third party and show off the [Sharified Identity](https://www.unumid.co/solutions/sharified-identity) capabilities. The source code for the ACME demo verifier lives in another demo [repository](https://github.com/UnumID/acme-demo-verifier-server).

## Integration Source Code Examples
Per Server SDK's quick start [guide](https://docs.unumid.co/quick-start-guide#server-sdk) and outlined in more detail in the Server SDK's[deployment overview](https://docs.unumid.co/deployment-overview#server-sdk) this project shows a concrete implementation of the required `/userCredentialRequests` endpoint as defined by the OpenApi [spec](https://gist.github.com/UnumIDMachine/146a0a428c683b756efd8240b31a4678).

It also show the flow of `userCode` creation and handling for association with a demo User and a resultant `did` callback value from the Unum ID SaaS. The `did` is necessary to be provided from Unum ID so that credentials can then be issued to the User with your collected User data. Once issuing the credential the User has the benefits of confidentiality over their own data. The persisted data about them can be deleted from your persisted datastore.

Futhermore in this repo one can see the many use cases of the Server SDK, which is used for [registering an Issuer](https://docs.unumid.co/server-sdk#registerissuer) and [issuing credentials](https://docs.unumid.co/server-sdk#issuecredentials).

It should be noted that this demo relies upon the the [ACME Verifier App](https://github.com/UnumID/acme-demo-verifier-server) project to handle presentation request creation and verification of presentations per design. ACME in this demo is a third party. This demo focusses on the integration necessary with the Unum ID Web Wallet to enable credential issuance to a user whom information has been verified about, particularly during sign up.

## Project Framework
This is a NodeJS application that uses [FeatherJS](https://docs.feathersjs.com/). The client interacts with it using the FeathersJS [Client](https://docs.feathersjs.com/api/client.html). Specifically using the [Socket.io](https://docs.feathersjs.com/api/socketio.html) FeathersJS client. Please keep these details in mind when using this repo as source code examples.

## Running Locally
Because this demo uses a real identity verification providers, running it for yourself is not available. We hope this repo serves as hopeful living example for how to integrate with Unum ID in the capacity of an Issuer.
