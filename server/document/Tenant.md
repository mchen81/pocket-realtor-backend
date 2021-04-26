## Update 
10/22: Add favorite listing

## Add Tenant's living location preference (Tenant token needed)

A tenant has two ways to add an area where s/he would like to live.

1. Provide a zip code

```
PUT: localhost:3000/tenant/preference/:zip
```

2. Provde city & state

```
PUT: localhost:3000/tenant/preference/
{
    "city" : "San Francisco",
    "state" : "CA"
}
```

## Update Tenant's living location preference (Tenant token needed)

A tenant could also update locations where s/he would like to live.  
**You can give cities or zipcodes, but you cannot give both.**
**Important: this will remove previous preference and get it updated by what you input**

```
POST: localhost:3000/tenant/preference/update
{
    "cities" : [
        {"city" : "San Francisco", "state": "CA"},
        {"city" : "San Jose", "state": "CA"},
        {"city" : "New York", "state": "NY"}
    ]
}
```

**OR**

```
{
    "zipcodes" : [
        "94117",
        "30005",
        "60002",
        "70001",
        "90087"
    ]
}
```

## Search tenants

Users can find other tenants who are interested in certain city,
A request could be :
**(NOTE: Must give both city and state)**

```
GET: localhost:3000/tenants?city=San Francisco&state=CA
```

If one of city or state is missing, it will find all tanants.  
Also you can find all users(with tenant's role) by:

```
GET: localhost:3000/tenants
```

## Get a tenant's preference

You can find a tenant's preference on both city and zips

```
GET: localhost:3000/tenant/preference/:userId
```

A json would be return like(sorted):

```
{
    "userId": "2",
    "preferedZips": [
        "30005",
        "60002",
        "70001",
        "90087",
        "94117"
    ],
    "preferredCities": [
        "Alpharetta, GA",
        "Antioch, IL",
        "Los Angeles, CA",
        "Metairie, LA",
        "San Francisco, CA"
    ]
}
```

## Like a listing (Token Needed)
Tenants can add a house listing to a favorite list
```
PUT localhost:3000/tenant/favorite/:listingId
```

## Deletion from favorite listing (Token Needed)

Tenants can delete a house listing in the favorite list
```
DELETE localhost:3000/tenant/favorite/:listingId
```

## View favorite list (Token Needed)
This api shows a tenant's(from token) favorite listings 
```
GET localhost:3000/tenant/favorite/
```
It returns a json array containg the listing's information, where addAt is the time that the user added the listing
```
[
    {
        "id": 302,
        "title": "volutpat erat",
        "salePrice": "18496558.40",
        "rentPrice": "5307.17",
        "address": "33 Leroy Street",
        "city": "Shawnee",
        "state": "KS",
        "zipcode": 66216,
        "addAt": "2020-10-29T10:54:58.232Z"
    },
    {
        "id": 300,
        "title": "amet",
        "salePrice": "14794255.84",
        "rentPrice": "1632.35",
        "address": "8071 Forest Drive",
        "city": "Kansas City",
        "state": "KS",
        "zipcode": 66160,
        "addAt": "2020-10-29T10:54:48.911Z"
    }
]
```


If given an user id, the token is not important, it will return the given user's favorite listings
```
GET localhost:3000/tenant/favorite/:userId
```
