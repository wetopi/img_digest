#Image biggest

img_diggest is the service in charge of resizing and beautifying our images.

## The worker

Service worker consumes from the Rabbitmq queue `img_diggest.prod.q.resizer`
This worker pics images from our temporary file storage *MongoDB GridFS*
And depending on position and applauses, It builds our different images, storing them in AWS S3

## Environment vars

All the env vars this service reads:

```
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

## Run worker

```bash
fig up -d
```