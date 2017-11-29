# -*- coding: utf-8 -*-
"""
Created on Wed Nov 08 12:08:51 2017

@author: dkkat

Get Data From WattTime
"""
import requests
import json
import datetime

header = {'Authorization': 'Token 0cf43b616f3f05e32dc2bbc4efe6edb950905d6a'}

query={'ba':'CAISO',
       'page_size':'2'}

getstr1=requests.request('GET','https://api.watttime.org/api/v1/datapoints/', params=query, headers=header)
resp3 = json.loads( getstr1.text )


resp3['results'][0]
