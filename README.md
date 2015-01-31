#Image digest

img_digest is the service in charge of resizing and beautifying our images.

## The worker

Service worker consumes from the Rabbitmq queue `img_digest.prod.q.resizer`
This worker pics images from our temporary file storage *MongoDB GridFS*
And depending on position and applauses, It builds our different images, storing them in AWS S3

## Environment vars

All the env vars this service reads:

```sh
NODE_ENV=development
DEBUG=*
RABBITMQ_VIRTUALHOST=/wetopi
RABBITMQ_USER
RABBITMQ_PASS
RABBITMQ_ENV_RABBITMQ_NODENAME=172.17.0.169
RABBITMQ_PORT_5672_TCP_PORT=5672
MONGODB_PORT=mongodb://172.17.0.168:27017/wetopi
AWS_S3_BUCKET=mybucket
AWS_S3_ENDPOINT=mybucket.s3-website-eu-west-1.amazonaws.com
AWS_ACCESS_KEY_ID=AAAAAAAAA
AWS_SECRET_ACCESS_KEY=XXXXXXXX/XXXX/XXXXXXXXX
AWS_DEFAULT_REGION=eu-west-1
```
## Run worker with docker command line

assuming we have MongoDB and rabbitMQ containers running as:
- api_rabbitmq_1
- api_mongodb_1

```sh
docker run --name img_diggest \
           -e NODE_ENV=development \
           -e RABBITMQ_VIRTUALHOST=/wetopi \
           -e RABBITMQ_USER \
           -e RABBITMQ_PASS \
           -e MONGODB_PORT=mongodb://mongodb:27017/wetopi \
           -e AWS_S3_BUCKET \
           -e AWS_S3_ENDPOINT \
           -e AWS_ACCESS_KEY_ID \
           -e AWS_SECRET_ACCESS_KEY \
           -e AWS_DEFAULT_REGION \
           --link api_rabbitmq_1:rabbitmq \
           --link api_mongodb_1:mongodb \
           -v /home/wetopi/img_digest:/usr/src/app \
           wetopi/node
           forever --watchDirectory=/usr/src/app -w -m 3 ./worker.js
```


## Run worker with fig

Fig does not let us to link containers from other fig.yml external files. 
Just in case, edit fig.yml in oder to update external container IP's

```bash
fig up -d
```

## 

> IMPORTANT: this fig.yml does not build a docker image. This is for local development.
> img_digest uses the npm module lwip. This module needs code targetting the machine that runs it. If lwip echoes 'no suitable image found.', then delete node_modules/lwip and perform npm install in you container.
