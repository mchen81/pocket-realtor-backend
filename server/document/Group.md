## Group owner

All operation here is token needed

### Create group

A tenant can create a group, name and description are neccessary

```
POST: localhost:3000/tenant/group/create
{
    "name" : "Group 20",
    "description" : "This is the 20th group"
}
```

If the group is successfully created, it will return:

```
{
    "code": 10000,
    "msg": "Request Success",
    "groupId": 11
}
```

### Update group

The group owner can update the group information.   
groupId is neccessary;   
name and description are optional here, but must provide at least one of them.   

```
POST: localhost:3000/tenant/group/update
{
    "groupId" : 11,
    "name" : "Group 201",
    "description" : "This is the group 201"
}
```

### Delete group

The group owner can delete a group.

```
DELETE localhost:3000/tenant/group/delete/:id

e.g. localhost:3000/tenant/group/delete/11
```

### Get group (Owner and Member side)

```
GET localhost:3000/tenant/group/:id
```

If the user(token) calling this api is the owner or member of the group, it will return some detail.   
The filed "notes" represents the messages that members wrote.  See [Note](https://github.com/sfdevshop/PocketRealtorApp/blob/serverBuilding/server/document/Group.md#notes-discusstion-board)
```
{
    "id": 8,
    "name": "Group 8",
    "description": "This is the group 8",
    "notes": [
        {
            "message": "Hello Guys!",
            "date": "2020-9-27",
            "time": "20:50:35",
            "user": {
                "id": 251,
                "firstname": "Erda",
                "last_name": "Horlick",
                "avatar": "https://i.imgur.com/0avxl7q.jpg"
            }
        }
    ],
    "owner": {
        "id": 250,
        "firstname": "Farand",
        "lastname": "Fotitt",
        "avatar": "https://i.imgur.com/0avxl7q.jpg"
    },
    "members": [
        {
            "id": 251,
            "firstname": "Erda",
            "lastname": "Horlick",
            "avatar": "https://i.imgur.com/0avxl7q.jpg"
        },
        {
            "id": 252,
            "firstname": "Emelita",
            "lastname": "Enochsson",
            "avatar": "https://i.imgur.com/0avxl7q.jpg"
        }
    ]
}
```

### Get group (Guest side)

```
GET localhost:3000/tenant/group/:id
```

The api is as the same as member/owner's side, but if the user does not belong to this group, it will simply return:

```
{
    "id": 8,
    "name": "123",
    "description": "23232",
    "size": 3,
    "owner": {
        "id": 250,
        "name": "Farand Fotitt",
        "avatar": "https://i.imgur.com/0avxl7q.jpg"
    }
}
```

size is the number of poeple in this group

### View all groups
This api will return all groups in the database
```
GET localhost:3000/tenant/find/groups
```

```
[
    {
        "id": 2,
        "name": "Group1",
        "description": "This is group one"
    },
    {
        "id": 5,
        "name": "Group5",
        "description": "Hello World!!!"
    },
]
```


### Get user group list
This api is to get which groups the user(token) is in(including group owner).   

```
GET localhost:3000/tenant/groups
```

It returns : 
```
[
    {
        "id": 12,
        "name": "Group 12",
        "description": "This is Group 12",
        "addedAt": "2020-10-26T06:51:18.395Z"
    },
    {
        "id": 13,
        "name": "I Love San Francisco",
        "description": "We'd like to find somewhere to live in San Francisco",
        "addedAt": "2019-8-13T11:50:12.748Z"
    }
]
```

## Invitation

A group owner can invites other tenants to join its group, the invitees can accept or reject the invitation.   

### Invite a tenant

Given ethier email or user's id is valid.  
The following example invites the user into group with id 6

```
POST localhost:3000/tenant/group/invite/
{
    "groupId" : 6,
    "email" : "ehorlick6y@miibeian.gov.cn"
}
```

OR

```
POST localhost:3000/tenant/group/invite/
{
    "groupId" : 6,
    "userId" : 251
}
```

### Get invitees

This api is to find invitations that a group owner made.   
Give a group id and the user's token must be the owner.   

```
GET localhost:3000/tenant/group/invite/:groupId
```
This api returns the invitees: (If no invitees, it's simply an empty array)   
```
[
    {
        "id": 300,
        "firstname": "Edgard",
        "lastname": "McCreedy",
        "avatar": "https://i.imgur.com/0avxl7q.jpg",
        "invitedAt": "2020-10-28T02:31:35.438Z"
    },
    {
        "id": 302,
        "firstname": "Lilith",
        "lastname": "Lant",
        "avatar": "https://i.imgur.com/0avxl7q.jpg",
        "invitedAt": "2020-10-28T02:31:47.982Z"
    },
    {
        "id": 303,
        "firstname": "Janetta",
        "lastname": "Tolumello",
        "avatar": "https://i.imgur.com/0avxl7q.jpg",
        "invitedAt": "2020-10-28T02:31:50.864Z"
    }
]
```

### Get Invitations
This api returns all invitations for a user (Token needed)
```
GET localhost:3000/tenant/invitations
```
It returns a json array which contains the inviations from different groups
```
[
    {
        "groupId": 9,
        "name": "111",
        "description": "23211132",
        "invitedAt": "2020-10-28T02:31:35.438Z"
    },
    {
        "groupId": 12,
        "name": "e1",
        "description": "1234T",
        "invitedAt": "2020-11-01T02:45:24.815Z"
    },
    {
        "groupId": 8,
        "name": "GG",
        "description": "GGGGGGGGGGGGGGGGG",
        "invitedAt": "2020-11-01T02:45:38.864Z"
    }
]
```


### Accept / Reject a invitation

Invitees can accept or reject an invitation   
To accept:   

```
PUT localhost:3000/tenant/group/invite/accept/:groupId
```

To reject:

```
PUT localhost:3000/tenant/group/invite/reject/:groupId
```

## Applications

Tenants can apply for joining a group, group owner can approve or reject it.  

### Apply for a group

Provide the :groupId to apply for the group

```
POST localhost:3000/tenant/group/apply/:groupId
```

### Get applications(Group Owner Side)

```
GET localhost:3000/tenant/group/waiting/:groupId
```

Group owners can see who has applied for the group,
The following example returns the users who has applied for group 8 and is waiting for owner's decision.

```
GET localhost:3000/tenant/group/waiting/8
```
RETURN: 
```
[
    {
        "id": 900,
        "firstname": "Dorie",
        "lsstname": "Dacre",
        "avatar": "https://i.imgur.com/0avxl7q.jpg",
        "applyAt": "2020-10-28T05:27:58.271Z"
    },
    {
        "id": 901,
        "firstname": "Mattheus",
        "lsstname": "McSaul",
        "avatar": "https://i.imgur.com/0avxl7q.jpg",
        "applyAt": "2020-10-28T05:28:00.929Z"
    },
    {
        "id": 902,
        "firstname": "Maurits",
        "lsstname": "Kinkade",
        "avatar": "https://i.imgur.com/0avxl7q.jpg",
        "applyAt": "2020-10-28T05:28:04.034Z"
    }
]

```

### Get applications(Applicant Side)

This api returns which groups the user(token) has applied.

```
GET localhost:3000/tenant/group/applied/list
```
It returns the groups that the user applied(Not responded by owner yet)
```
[
    {
        "id": 8,
        "name": "123",
        "description": "23232",
        "applyAt": "2020-10-27T13:32:12.526Z"
    }
]
```

### Withdraw an application

A applicant can withdraw an application by:

```
DELETE localhost:3000/tenant/group/applied/cancel/:groupId
```

### Accept/ Reject applications (Owner side)

The following example is to accept the application which is sent by the user 251.  
If the "approved" is given false, it means the application is rejected.

```
PUT localhost:3000/tenant/group/apply/respond/
{
    "groupId" : 8,
    "applicantId" : 251,
    "approved" : true
}

```

## Notes (Discusstion Board)
This Api will send a message to a group.  
```
PUT localhost:3000/tenant/group/notes/put/:groupId
{
   "message" : "Hello Guys!"
}
```
* Messages only can be seen by group the owner and members.  
* Messages will be displayed in [GET-GROUP](https://github.com/sfdevshop/PocketRealtorApp/blob/serverBuilding/server/document/Group.md#get-group-owner-and-member-side)

## GET Owner's group
This routes returns an users groups where the user is the owner

```
GET /tenant/group/owner/:userId
```
If the user does own a group, it returns
```
{
    "code": 10000,
    "msg": "Request Success",
    "data": [
        {
            "id": 54,
            "name": "SF Renters1",
            "description": "Good renters"
        }
    ]
}
```
Otherwise, it's a empty array
{
    "code": 10000,
    "msg": "Request Success",
    "data": []
}
