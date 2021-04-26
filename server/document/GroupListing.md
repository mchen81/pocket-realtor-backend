## Listings in Groups
This section is about user's operations in adding/viewing/approving listings in a group.  
All operation here is token needed

### Add a listing to a group
This route allows a **group member** add a listing into a group.  
The following example shows a user add the listing(with id 300) to group 9.  
```
POST: localhost:3000/tenant/group/addListing
{
    "groupId" : 9,
    "listingId" : 300
}
```

### View Listings in Group
This api returns listings added by members in a group.   
**GET: localhost:3000/tenant/group/view/listings/:groupId**   
The following example shows all listings in group 9(order by "approvements").   
Note: the "approvements" means how many members have approved this listing,   
"isApproved" means if the viewing user has approved the listing;   
"approvers" means the users' id who approved the listings
```
GET localhost:3000/tenant/group/view/listings/9
```
RETURN:
```
[
    {
        "id": 301,
        "name": "vel nisl",
        "description": "Fusce posuere felis sed lacus. Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl. Nunc rhoncus dui vel sem.\r\n\r\nSed sagittis. Nam congue, risus semper porta volutpat, quam pede lobortis ligula, sit amet eleifend pede libero quis orci. Nullam molestie nibh in lectus.\r\n\r\nPellentesque at nulla. Suspendisse potenti. Cras in purus eu magna vulputate luctus.",
        "approvers": [
            300, 301
        ],
        "approvements": 2,
        "isApproved": true
    },
    {
        "id": 300,
        "name": "amet",
        "description": "Donec diam neque, vestibulum eget, vulputate ut, ultrices vel, augue. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec pharetra, magna vestibulum aliquet ultrices, erat tortor sollicitudin mi, sit amet lobortis sapien sapien non mi. Integer ac neque.\r\n\r\nDuis bibendum. Morbi non quam nec dui luctus rutrum. Nulla tellus.",
        "approvers": [
            300
        ],
        "approvements": 1,
        "isApproved": true
    },
    {
        "id": 302,
        "name": "volutpat erat",
        "description": "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Proin risus. Praesent lectus.\r\n\r\nVestibulum quam sapien, varius ut, blandit non, interdum in, ante. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Duis faucibus accumsan odio. Curabitur convallis.",
        "approvers": [
            301
        ],
        "approvements": 1,
        "isApproved": false
    }
]
```


### Approve a listing
A group member can approve a listing.  

```
PUT localhost:3000/tenant/group/approve/listing
 {
    "groupId" : 9,
    "listingId" : 302
}
```

### Withdraw an approvement
A group member can take back an approvement.  
```
DELETE localhost:3000/tenant/group/approve/listing
 {
    "groupId" : 9,
    "listingId" : 302
}
```



### View who has approved a listing

This api allows all group members to see who has approved a lissting
```
GET localhost:3000/tenant/group/listings/approved
{
    "groupId" : 9,
    "listingId" : 302
}
```
RETUEN(A Json array): 
```
[
    {
        "id": 303,
        "firstname": "Janetta",
        "lastname": "Tolumello",
        "avatar": "https://i.imgur.com/0avxl7q.jpg"
    }
]
```