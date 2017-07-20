/**
 * Copyright 2016 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an 'AS IS' BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
'use strict';

var utils = require('fabric-client/lib/utils.js');
var logger = utils.getLogger('create-dynamic-channel');

var hfc = require('fabric-client');
var util = require('util');
var fs = require('fs');
var path = require('path');
hfc.addConfigFile(path.join(__dirname, 'network-config.json'));
var config1 = require('../config.json');
var helper = require('./helper.js');

//var testUtil = require('../unit/util.js');
//var e2eUtils = require('./e2e/e2eUtils.js');

var the_user = null;

var ORGS = hfc.getConfigSetting('network-config');

//
//Attempt to send a request to the orderer with the sendCreateChain method
//
var createDynoChannel = function(channelName,channelConfigPath,userName,orgName) {
	var channel_name = channelName;
	//hfc.setConfigSetting('E2E_CONFIGTX_CHANNEL_NAME', channel_name);
	logger.info('\n\n >>>>>>  Will create new channel with name :: %s <<<<<<< \n\n',channel_name);

	//
	// Create and configure the test chain
	//
	var client = helper.getClientForOrg(orgName);
	var caRootsPath = ORGS.orderer.tls_cacerts;
	let data = fs.readFileSync(path.join(__dirname,caRootsPath));
	let caroots = Buffer.from(data).toString();

	var orderer = client.newOrderer(
		ORGS.orderer.url,
		{
			'pem': caroots,
			'ssl-target-name-override': ORGS.orderer['server-hostname']
		}
	);

	var config = null;
	var signatures = [];

	// Acting as a client in org1 when creating the channel
	var org = ORGS.org1.name;

	utils.setConfigSetting('key-value-store', 'fabric-client/lib/impl/FileKeyValueStore.js');

	return hfc.newDefaultKeyValueStore({
		path: config1.keyValueStore + '_' +(ORGS[orgName].name)
	}).then((store) => {
		client.setStateStore(store);

		return helper.getOrgAdmin(orgName);
	}).then((admin) =>{
		logger.info('Successfully enrolled user \'admin\' for orderer');

		logger.info('\n\n***** Get the configtx config update configuration  *****\n\n');
		// use the config update created by the configtx tool
		let envelope_bytes = fs.readFileSync(path.join(__dirname,channelConfigPath));
		config = client.extractChannelConfig(envelope_bytes);
		logger.debug('Successfull extracted the config update from the configtx envelope');

		// sign the config
		var signature = client.signChannelConfig(config);
		logger.info('Successfully signed config update');
		// collect signature from org1 admin
		// TODO: signature counting against policies on the orderer
		// at the moment is being investigated, but it requires this
		// weird double-signature from each org admin
		signatures.push(signature);
		signatures.push(signature);

		// make sure we do not reuse the user

		client._userContext = null;
		/*return helper.getOrgAdmin("org2");
	}).then((admin) => {
		// sign the config
		var signature = client.signChannelConfig(config);
		logger.debug('Successfully signed config update');

		// collect signature from org2 admin
		// TODO: signature counting against policies on the orderer
		// at the moment is being investigated, but it requires this
		// weird double-signature from each org admin
		signatures.push(signature);
		signatures.push(signature);

		// make sure we do not reuse the user
		client._userContext = null;*/
		return helper.getOrgAdmin(orgName)
	}).then((admin) => {
		logger.info('Successfully enrolled user \'admin\' for orderer');
		the_user = admin;

		// sign the config
		var signature = client.signChannelConfig(config);
		logger.info('Successfully signed config update');

		// collect signature from orderer org admin
		// TODO: signature counting against policies on the orderer
		// at the moment is being investigated, but it requires this
		// weird double-signature from each org admin
		signatures.push(signature);
		signatures.push(signature);

		logger.debug('\n***\n done signing \n***\n');

		// build up the create request
		let nonce = utils.getNonce();
		let tx_id = client.newTransactionID();
		var request = {
			config: config,
			signatures : signatures,
			name : channel_name,
			orderer : orderer,
			txId  : tx_id,
			nonce : nonce
		};

		// send to create request to orderer
		return client.createChannel(request);
	})
	.then((result) => {
		logger.debug('\n***\n completed the create \n***\n');

		logger.debug(' response ::%j',result);
		logger.debug('Successfully created the channel.');
		if(result.status && result.status === 'SUCCESS') {
			let response = {
				success: true,
				message: 'Channel \'' + channelName + '\' created Successfully'
			};
		  return response;
		} else {
			logger.error('\n!!!!!!!!! Failed to create the channel \'' + channelName +
				'\' !!!!!!!!!\n\n');
			throw new Error('Failed to create the channel \'' + channelName + '\'');
		}
	}, (err) => {
		logger.error('Failed to initialize the channel: ' + err.stack ? err.stack : err);
		throw new Error('Failed to initialize the channel: ' + err.stack ? err.stack : err);
	})
};

exports.createDynoChannel=createDynoChannel;
