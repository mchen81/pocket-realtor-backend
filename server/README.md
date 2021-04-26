# Server usage

## Update

### 10/7

1. Add create/delete and search for listings

### 10/15

1.  Add More properties in listing (type, rent_price, sale_price, bath_rooms, area, age)
2.  change listing property name : introduction -> description
3.  Add tenants preference functions (add, update, search, get)
4.  User's profile updated: add gender and occupation
5.  Add get/copy/update listing functionality

### 10/18
1. Change conditions in searching listings

### 10/22
1. Users are able to see their history of exploring tenants and listings
2. Tenants are able to like a listing, and delete it
3. Modify some structures

### 10/27
1. Implemented grouping functionalities. [See Here](https://github.com/sfdevshop/PocketRealtorApp/tree/serverBuilding/server/document#tenant-group)

### 10/28
1. Add a filed "status" in listing table.(About status, see [ListingStatus.js](https://github.com/sfdevshop/PocketRealtorApp/blob/serverBuilding/common/Constans/ListingStatus.js))
2. Listing owner can update liting's status now.

### 10/29
1. Add "isFavorite" field into [GET-LISTING](https://github.com/sfdevshop/PocketRealtorApp/blob/serverBuilding/server/document/Listing.md#get-a-listing)

### 10/30
1. Change output from [getUserRole](https://github.com/sfdevshop/PocketRealtorApp/blob/serverBuilding/server/document/User.md#update-users-role-token-needed)
2. When calling getListing, now the image_links will return a array containing at least 5 elements(could be empty strings if images are not enough). 
3. When searching listings, the image_links will only be the first image_link in the database. If no images, it will be a empty string 
4. Remove the restriction of being a tenant while putting/deleting/getting favorite listings 

### 10/31
1. Now the [GetFavorite](https://github.com/sfdevshop/PocketRealtorApp/blob/serverBuilding/server/document/Tenant.md#view-favorite-list-token-needed) returns listing's address and price
2. [Get User's Invitaions](https://github.com/sfdevshop/PocketRealtorApp/blob/serverBuilding/server/document/Group.md#get-invitations)
3. [View all groups](https://github.com/sfdevshop/PocketRealtorApp/blob/serverBuilding/server/document/Group.md#view-all-groups)

### 11/9
1. Create a few [group-listing functions](https://github.com/sfdevshop/PocketRealtorApp/blob/serverBuilding/server/document/Readme.md#listings-in-groups)

### 11/10
1. Add type=0 (both rent and sale) into listing search filter.

### 11/15
1. Return "approvers" when viewing listings in a group

### 11/21 
1. Add createdAt and updatedAt on Listing
2. Create a new route: [Get Owner's Listings](https://github.com/sfdevshop/PocketRealtorApp/blob/serverBuilding/server/document/Listing.md#get-owners-listingstoken-needed)

### 11/22
1. Add user's id in getUserProfile
2. Add "isAgent" in getting a listing

### 11/23
1. Add [chat room](https://github.com/sfdevshop/PocketRealtorApp/blob/serverBuilding/server/document/Readme.md#chat-room) routes 

### 11/26
1. Fix typos
2. Add listingId to personal chat room
3. Order the chatrooms by the last message

### 11/27
1. Returns user basic info while login/register
2. Add more features about [applications](https://github.com/sfdevshop/PocketRealtorApp/blob/serverBuilding/server/document/Readme.md#applications)

### Configuration
Before starting the server, there some configurations need to be settup   
1. **[Basic config](https://github.com/sfdevshop/PocketRealtorApp/blob/master/server/config.js)**   
  * Table reset/alter: If you need to change table schemas, enable alter. If you need to clean all data in database, enable reset.
  * You need to enable ethier http or https. If it's https, you also need to provide the ssl certification files path
  * You can setup how long is valid after user has logged in.   
2. **[Database config](https://github.com/sfdevshop/PocketRealtorApp/blob/master/server/database/config.js)**   
  * You can settup the database connection here, like hostname and password   
3. **[JWT SECRET](https://github.com/sfdevshop/PocketRealtorApp/blob/master/server/static/Constant.js)**   
  * This is the key for jwt encryption, you may want to change when this project is in production   
   


## Set up

- Input your database's setting in database/config.js
- Install moduels (package PR may need to be installed manaually)
- Set up the listening port and tables reset in config.js 

```
npm install
```
### Start Server

```
npm run start
```

## Server Response
- No matter requests success or fail, the server will return a json in {code: code, msg: message} (sometimes with token) where code and message are in static/ResponseTemplate.js

## API
See [documant/Readme.md](https://github.com/sfdevshop/PocketRealtorApp/tree/serverBuilding/server/document).

