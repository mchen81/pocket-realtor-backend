## Get History 
When calling GET:localhost:3000/user/60008, where 60008 is user itself, the return will become the following: 
```
{
    "data": {
        "email": "56561@gmail.com",
        "firstname": "Jerry",
        "lastname": "Chen",
        "nickname": null,
        "birthday": null,
        "gender": null,
        "occupation": null,
        "intro": null,
        "avatar": null
    },
    "history": {
        "tenants": [
            {
                "tenantId": 19,
                "tenantName": "Goldarina De Giovanni",
                "date": "2020-9-22",
                "hour": 20,
                "minute": 5
            },
            {
                "tenantId": 18,
                "tenantName": "Ronnie Blofeld",
                "date": "2020-9-22",
                "hour": 20,
                "minute": 5
            },
            {
                "tenantId": 15,
                "tenantName": "Cecelia Gooders",
                "date": "2020-9-22",
                "hour": 20,
                "minute": 5
            },
            {
                "tenantId": 10,
                "tenantName": "Prince Saynor",
                "date": "2020-9-22",
                "hour": 20,
                "minute": 5
            }
        ],
        "listings": [
            {
                "listingId": 10,
                "title": "quis odio consequat",
                "date": "2020-9-22",
                "hour": 19,
                "minute": 44
            },
            {
                "listingId": 9,
                "title": "eros suspendisse accumsan",
                "date": "2020-9-22",
                "hour": 19,
                "minute": 43
            },
            {
                "listingId": 5,
                "title": "mattis odio",
                "date": "2020-9-22",
                "hour": 19,
                "minute": 43
            }
        ]
    }
}

```


## Delete History
By calling the following API with token, the related history can be removed.   
```
DELETE localhost:3000/history/tenant
DELETE localhost:3000/history/listing
```