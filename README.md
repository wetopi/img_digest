#Image biggest

img_diggest is the service in charge of resizing and beautifying our images.

## The worker

Service worker consumes from the Rabbitmq queue `img_diggest.prod.q.resizer`
This worker pics images from our temporary file storage *MongoDB GridFS*
And depending on position and applauses, It builds our different images, storing them in AWS S3

## Run worker

´´´bash
fig up -d
´´´