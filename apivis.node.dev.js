#!/usr/bin/env node
'use strict';

const apivis = require('./src/apivis');
  const {apiStr} = apivis;

console.log(apiStr(process));
