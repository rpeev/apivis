#!/usr/bin/env node
'use strict';

const apivis = require('./dist/apivis.cjs');
  const {apiStr} = apivis;

console.log(apiStr(process));
