## Chat Room API
This api is for both personal and group chat room.   
Tokne is needed in the all routes here.   

### Find or create a personal chat
This route is called when a tenant wants to contact a host and have a discussion about a listing.  
If the chatroom exists, it returns the chatroom Id and replaces the listingId if it's different from the previous one.   
Or, if the chat room does not exist, it wil create one for the two users.   
**Note**: The listingId should be owned by the owner, and the calling user should be tenant.  

```
GET: localhost:3000/conversation/find/?hostId=[hostId]&listingId=[listingId]
replace [hostId] and [listingId]
```
returns
```
{
    "conversationId": "cac36e57-2ad2-4a68-8667-e7df96be8e97",
    "targetId": "200",
    "listingId": "140"
}
```


### Get all existing chat room for a user
This route returns all chat rooms a user has.   
When "isGroupChat" is true, the target id and name means the group's id and name.  
On the other hand, when "isGroupChat"  is false, the target id and name means the target-user's id and name.   
The return will be sorted by the last message date. If no messages in the chat, it will be put at the last.   

```
GET: localhost:3000/conversation/all
```
returns: 
```
[
    {
        "conversationId": "8d7be07c-fb02-4301-b31f-a7edd035e2ad",
        "targetId": 99999,
        "targetName": "Finding New Your House",
        "messages": [
            {
                "senderId": 300,
                "content": "Hello world1",
                "date": "2020-11-24T05:48:56.444Z"
            },
            {
                "senderId": 300,
                "content": "Hello world2",
                "date": "2020-11-24T05:49:07.676Z"
            },
            {
                "senderId": 300,
                "content": "Hello world3",
                "date": "2020-11-24T05:49:12.056Z"
            },
            {
                "senderId": 300,
                "content": "Hello world3",
                "date": "2020-11-24T06:06:58.696Z"
            },
            {
                "senderId": 300,
                "content": "You cool",
                "date": "2020-11-27T04:17:17.272Z"
            }
        ],
        "img": "/",
        "recipients": [
            {
                "id": 300,
                "name": "Edgard McCreedy",
                "avatar": "https://i.imgur.com/0avxl7q.jpg"
            },
            {
                "id": 301,
                "name": "Jim Sommerfeld",
                "avatar": "https://i.imgur.com/0avxl7q.jpg"
            },
            {
                "id": 302,
                "name": "Lilith Lant",
                "avatar": "https://i.imgur.com/0avxl7q.jpg"
            },
            {
                "id": 303,
                "name": "Janetta Tolumello",
                "avatar": "https://i.imgur.com/0avxl7q.jpg"
            },
            {
                "id": 304,
                "name": "Trey Catonnet",
                "avatar": "https://i.imgur.com/0avxl7q.jpg"
            },
            {
                "id": 305,
                "name": "Benedick Kimble",
                "avatar": "https://i.imgur.com/0avxl7q.jpg"
            }
        ],
        "isGroupChat": true
    },
    {
        "conversationId": "e43f572c-2cce-411c-b3a4-6ffec57125df",
        "targetId": 10,
        "targetName": "Prince Saynor",
        "listingId": 100,
        "messages": [
            {
                "senderId": 300,
                "content": "Hello worl11111",
                "date": "2020-11-24T07:23:03.962Z"
            },
            {
                "senderId": 300,
                "content": "Hello worl11111",
                "date": "2020-11-27T03:42:02.823Z"
            },
            {
                "senderId": 300,
                "content": "Hello wor222",
                "date": "2020-11-27T03:44:53.712Z"
            },
            {
                "senderId": 300,
                "content": "You cool",
                "date": "2020-11-27T04:15:52.020Z"
            }
        ],
        "img": "https://i.imgur.com/0avxl7q.jpg",
        "isGroupChat": false
    },
    {
        "conversationId": "d1ff6040-e0d5-4647-aa9a-1b36cc532fff",
        "targetId": 2,
        "targetName": "Group 20",
        "messages": [],
        "img": "/",
        "recipients": [
            {
                "id": 300,
                "name": "Edgard McCreedy",
                "avatar": "https://i.imgur.com/0avxl7q.jpg"
            },
            {
                "id": 600,
                "name": "Sigismundo Mabe",
                "avatar": "https://i.imgur.com/0avxl7q.jpg"
            }
        ],
        "isGroupChat": true
    },
    {
        "conversationId": "e6ebed34-9eb7-40fb-967f-a17fdd9e1867",
        "targetId": 1,
        "targetName": "Hello world",
        "messages": [],
        "img": "/",
        "recipients": [
            {
                "id": 300,
                "name": "Edgard McCreedy",
                "avatar": "https://i.imgur.com/0avxl7q.jpg"
            }
        ],
        "isGroupChat": true
    },
    {
        "conversationId": "899d93db-657b-4202-8dcf-9b5a617976fb",
        "targetId": 200,
        "targetName": "Kerry Watts",
        "listingId": 140,
        "messages": [],
        "img": "https://i.imgur.com/0avxl7q.jpg",
        "isGroupChat": false
    },
    {
        "conversationId": "321b0ea8-24b2-4663-b48f-09bfd8cf0363",
        "targetId": 448,
        "targetName": "Corilla Sidney",
        "listingId": 100,
        "messages": [],
        "img": "https://i.imgur.com/0avxl7q.jpg",
        "isGroupChat": false
    }
]
```

### Get a chat room 
Given a chat room id(and user's id from token), this route returns it's information. 
```
GET localhost:3000/conversation/get/e43f572c-2cce-411c-b3a4-6ffec57125df
```
returns: 
```
{
    "targetId": 10,
    "targetName": "undefined Saynor",
    "img": "https://i.imgur.com/0avxl7q.jpg",
    "messages": [
            {
                "senderId": 300,
                "content": "Hello world3",
                "date": "2020-11-24T06:06:58.696Z"
            }
    ],
    "isGropuChat": false
}
```

### Send a message
This route allows user to send a message into a chat room.   

Note: Needs to provide 3 fileds : 
1. isGropuChat : if the chat room you are sending is a group chat, it's true. Otherwise, false.   
2. conversactionId: the chat room id
3. message: the message you want to send, cannot be empty
```
PUT localhost:3000/conversation/message
{
    "isGroupChat" : false,
    "conversationId" : "e43f572c-2cce-411c-b3a4-6ffec57125df",
    "message" : "Hello worl11111"
}
```
**BUG** If the "isGroupChat" given wrongly, it still returns request success but no data updated.   
If the messaged is successcully send, it returns.   
```
{
    "code": 10000,
    "msg": "Request Success"
}
```

