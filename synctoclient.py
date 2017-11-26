import requests
import json
import random
import time
import datetime

def localPutObject(object_id, object_name):
    #base = 'http://13.92.90.127:5000'
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

def localPostObject(object_id, object_name):
    #base = 'http://13.92.90.127:5000'
    base = 'http://13.92.90.127:8000'
    network_id = 'local'
    header = {}

    query = {
        'object-name': object_name
    }
    endpoint = '/networks/'+network_id+'/objects/'+object_id
    response = requests.request('POST', base + endpoint, params=query, headers=header, timeout=120 )
    resp = json.loads( response.text )
    if resp['object-code'] == 201:
        print('Create object test-object: ok')
    else:
        print('Create object test-object: error')
        print( response.text )

def localDeleteObject(object_id):
    #base = 'http://13.92.90.127:5000'
    base = 'http://13.92.90.127:8000'
    network_id = 'local'
    header = {}

    query = {
    }
    endpoint = '/networks/'+network_id+'/objects/'+object_id
    response = requests.request('DELETE', base + endpoint, params=query, headers=header, timeout=120 )
    resp = json.loads( response.text )
    if resp['object-code'] == 201:
        print('DELETE object test-object: ok')
    else:
        print('DELETE  object test-object: error')
        print( response.text )

def localPutStream(object_id,stream_id,stream_name,stream_data_type):
    #base = 'http://13.92.90.127:5000'
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

def localPostStream(object_id,stream_id,stream_name,stream_data_type):
    #base = 'http://13.92.90.127:5000'
    base = 'http://13.92.90.127:8000'
    network_id = 'local'
    header = {}
    points_type = stream_data_type[0] #[i]nteger, [f]loat, [s]tring
    query = {
        'stream-name': stream_name,
        'points-type': points_type # 'i', 'f', or 's'
    }
    endpoint = '/networks/'+network_id+'/objects/'+object_id+'/streams/'+stream_id
    response = requests.request('POST', base + endpoint, params=query, headers=header, timeout=120 )
    resp = json.loads( response.text )
    if resp['stream-code'] == 201:
        print('Create stream test-stream: ok')
    else:
        print('Create stream test-stream: error')
        print( response.text )

def localDeleteStream(object_id,stream_id,stream_name):
    #base = 'http://13.92.90.127:5000'
    base = 'http://13.92.90.127:8000'
    network_id = 'local'
    header = {}
    query = {
        'stream-name': stream_name,
    }
    endpoint = '/networks/'+network_id+'/objects/'+object_id+'/streams/'+stream_id
    response = requests.request('DELETE', base + endpoint, params=query, headers=header, timeout=120 )
    resp = json.loads( response.text )
    if resp['stream-code'] == 201:
        print('DELETE stream test-stream: ok')
    else:
        print('delete stream test-stream: error')
        print( response.text )

def localPostPoints(object_id, stream_id, point_value,point_at):
    #base = 'http://13.92.90.127:5000'
    base = 'http://13.92.90.127:8000'
    network_id = 'local'
    header = {}
    query = {
        'points-value': point_value,
        'points-at': point_at
    }
    endpoint = '/networks/'+network_id+'/objects/'+object_id+'/streams/'+stream_id+'/points'
    response = requests.request('PUT', base + endpoint, params=query, headers=header, timeout=120 )
    resp = json.loads( response.text )
    print resp
    if resp['points-code'] == 200:
        print('Create points: ok')
    else:
        print('Create points: error')
        print( response.text )






def synctoclient_object(request_method, object_id, object_name):
    if request_method == 'PUT':
        localPutObject(object_id, object_name)
    elif request_method == 'POST':
        localPostObject(object_id, object_name)
    elif request_method == 'DELETE':
        localDeleteObject(object_id)


def synctoclient_stream(request_method, object_id, stream_id, stream_name, points_type):
    if request_method == 'PUT':
        localPutStream(object_id, stream_id, stream_name, points_type)
    elif request_method == 'POST':
        localPostStream(object_id, stream_id, stream_name, points_type)
    elif request_method == 'DELETE':
        localDeleteStream(object_id, stream_id, stream_name)

def synctoclient_point(request_method, object_id, stream_id, point_value,point_at):
    localPostPoints(object_id, stream_id, point_value,point_at)
