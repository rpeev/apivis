#!/usr/bin/env node
'use strict';

const apivis = require('../dist/apivis.node');
  const {apiStr} = apivis;

console.log(apiStr(process));
