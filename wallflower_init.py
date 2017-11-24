#####################################################################################
#
#  Copyright (c) 2016 Eric Burger, Wallflower.cc
#
#  MIT License (MIT)
#
#  Permission is hereby granted, free of charge, to any person obtaining a copy
#  of this software and associated documentation files (the "Software"), to deal
#  in the Software without restriction, including without limitation the rights
#  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
#  copies of the Software, and to permit persons to whom the Software is
#  furnished to do so, subject to the following conditions:
#
#  The above copyright notice and this permission notice shall be included in
#  all copies or substantial portions of the Software.
#
#  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
#  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
#  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
#  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
#  SOFTWARE.
#
#####################################################################################

'''
 In this example, we will create an object (test-object) and a stream
 (test-stream) and populate it with random values.
'''
import requests
import json
import random
import time
import datetime

def localPutObject(object_id, object_name):
    #base = 'http://127.0.0.1:5000'
    base = 'http://13.92.90.127:8000'
    network_id = 'local'
    header = {}

    query = {
        'object-name': object_name
    }
    endpoint = '/networks/'+network_id+'/objects/'+object_id
    response = requests.request('PUT', base + endpoint, params=query, headers=header, timeout=120 )
    resp = json.loads( response.text )
    if resp['object-code'] == 201:
        print('Create object test-object: ok')
    else:
        print('Create object test-object: error')
        print( response.text )

def localPutStream(object_id,stream_id,stream_name,stream_data_type):
    #base = 'http://127.0.0.1:5000'
    base = 'http://13.92.90.127:8000'
    network_id = 'local'
    header = {}
    points_type = stream_data_type[0] #[i]nteger, [f]loat, [s]tring
    query = {
        'stream-name': stream_name,
        'points-type': points_type # 'i', 'f', or 's'
    }
    endpoint = '/networks/'+network_id+'/objects/'+object_id+'/streams/'+stream_id
    response = requests.request('PUT', base + endpoint, params=query, headers=header, timeout=120 )
    resp = json.loads( response.text )
    if resp['stream-code'] == 201:
        print('Create stream test-stream: ok')
    else:
        print('Create stream test-stream: error')
        print( response.text )

def localPutFromJSON(json_filename):
    #Read JSON data into the datastore variable
    with open(json_filename, 'r') as f:
        datastore = json.load(f)

    #Use the new datastore datastructure
    print datastore
    # for object in json
    #     create
    #     for stream in objects
    #         create
    for obj in datastore['objects']:
        localPutObject(obj['object-id'], obj['object-display-name'])
        for stream in obj['streams']:
            localPutStream(obj['object-id'], stream['stream-id'], stream['stream-display-name'], stream['stream-data-type'])




def extra():
    print("Start sending random points (Ctrl+C to stop)")
    endpoint = '/networks/local/objects/test-object/streams/test-stream/points'
    while True:
        query = {
            'points-value': random.randint(0, 10),
            'points-at': datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        }
        response = requests.request('POST', base + endpoint, params=query, headers=header, timeout=120 )
        resp = json.loads( response.text )
        if resp['points-code'] == 200:
            print( 'Update test-stream points: ok')
        else:
            print( 'Update test-stream points: error')
            print( response.text )
        time.sleep(2)

localPutFromJSON('mock-initialize/object-definitions.json')
