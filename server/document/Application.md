## Applications

A group owner can decide weather the group is going to apply a listing.
All operations here are token needed

### Apply for a listing as a group

When a gorup owner sends the application, the listing owner will be able to see each members in the group.  
Also, the listing state (in the group) will be in pending(id = 1).

```
POST localhost:3000/tenant/group/listings/apply
{
    "groupId": 99999,
    "listingId": 100,
    "description": "Hello, this is Jerry. I would like to know when you would be available to meet"
}
```

### Update an application

This route is for group owner to modify description after s/he sent the application.

```
PUT localhost:3000/tenant/group/listing/application/update
{
    "groupId": 99999,
    "listingId": 100,
    "description": "BBBB, this is Jerry. I would like to know when you would be available to meet"
}
```

### Delete an application

If a group owner sent an application and wants to take it back, this api will be called.  
After the deletion, the listing owner can no longer see the group members, and the state would be in N/A(id = 0).

```
DELETE localhost:3000/tenant/group/listing/application/delete
{
    "groupId": 99999,
    "listingId": 100
}
```

### Get Applications for each listing (listing owner side)

A listing owner can see who has applied the listing.

```
localhost:3000/listing/applications/:listingId
```

The following example shows a group(id=99999) applied the [:listing] at 2020-11-28T03:20:37.310Z, the state is in pending(id = 1)

```
[
    {
        "groupId": 99999,
        "name": "Finding New Your House",
        "description": "We are looking for an apartment nearby new york city",
        "state": 1,
        "applyAt": "2020-11-28T03:20:37.310Z"
    }
]
```
