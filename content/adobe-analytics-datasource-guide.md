---
title: "Adobe Analytics Data Source API with Visitor IDs"
date: 2020-04-13T16:58:13-07:00
draft: false
description: "Enhance your data using Adobe Analytics Datasource API to attach external data points to your visitors."
summary: "Enhance your data using Adobe Analytics Datasource API to attach external data points to your visitors."
type: "post"
categories:
- Analytics
tags:
- Adobe Analytics
---

The documentation Adobe provides for their Analytics' API is awful. Scattered web pages, Github repositories, and Swagger documentation with outdated code samples sprinkled in for flavor. At best you're left shooting in the dark.

Luckily, I've trudged through the swamp for you. If you're trying to connect external visitor data with your web data, this is your guiding light.

I wrote this in Python to increase compatibility with other APIs you might interface with. Specifically, I was connecting to Marketo.

You can find a full sample at {{< externallink "this repository" "https://github.com/joshuabradley012/adobe-datasource/" >}}.

## Create a Data Source

Data Source upload requires that a metric be included in the upload. For this, I created a unique success event named "Data Source Upload" so I wouldn't conflate other metrics.

After you have that metric you can set up your Data Source in Adobe Analytics. Navigate to "Admin > Data Sources" and then go to the "Create" tab. Here you will select "Generic > Generic Data Source (Transaction ID)" and follow the configuration steps.

Note that this data source requires that you upload using the `transactionID`. In your upload file, you will be able to send the Marketing Cloud Visitor ID as this dimension and data will map to the user properly. Optionally, you can set unique transaction IDs if that isn't the use case you are looking for.

On the Choose Metrics step, include the metric you included. For Choose Data Dimensions, you can select anything. Keep in mind, you don't have to use these dimensions in your upload, and you don't have to include every dimension you will use.

Once finished, you will receive FTP credentials, but you won't be using these if you are using the API method I outline below, which is recommended for security.

## Create a Data Feed

To connect data to a specific visitor, you will need their Marketing Cloud Visitor ID. It is possible to collect this on the front end with Adobe Launch, but the most consistent and accurate source is directly from an Adobe Data Feed.

Because I am placing this script on AWS, I created an S3 bucket to store the Data Feed. Create a private bucket with default settings. For Adobe to have proper access, you will also need a dedicated IAM user for the bucket. This is the permission policy I attached to the user.

{{< highlight json >}}
{
		"Version": "2012-10-17",
		"Statement": [
				{
						"Sid": "VisualEditor0",
						"Effect": "Allow",
						"Action": [
								"s3:PutObject",
								"s3:GetObject"
						],
						"Resource": "arn:aws:s3:::BUCKET_NAME/*"
				},
				{
						"Sid": "VisualEditor1",
						"Effect": "Allow",
						"Action": "s3:ListBucket",
						"Resource": "arn:aws:s3:::BUCKET_NAME"
				}
		]
}
{{< / highlight >}}

If you have never done this, AWS's documentation is helpful.

* {{< externallink "How Do I Create an S3 Bucket?" "https://docs.aws.amazon.com/AmazonS3/latest/user-guide/create-bucket.html" >}}
* {{< externallink "Creating an IAM User in Your AWS Account" "https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html" >}}

After creating your user, you will also need their Access Keys for use in Adobe. You can follow {{< externallink "these steps" "https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys" >}} to obtain them.

With your S3 bucket created and Access Keys ready, you can create a data feed from Adobe Analytics under "Admin > Data Feeds" that will upload data to it. You cannot delete data feeds, so be sure to make it correctly.

I went with a Daily Feed, with "No Delay" and no "End Date". For "Destination" I chose "S3" as the type, and entered the information accordingly, with nothing for the "Path" so data would be uploaded at the root level.

For "Data Column Definitions" I left "Remove Escaped Characters" unchecked, used "Gzip" as the compression format, "Multiple Files" as the packaging type, and "Manifest File" for Manifest.

The columns you include are dependent on your implementation. But I went with `mcvisid` and `evar22`, which are the Marketing Cloud Visitor ID and Marketo User ID, respectively.

Data should start flowing to your S3 bucket now. The main data file comes in as a `.tsv.gz` file that you can download and unzip with this command.

```
gunzip file.tsv.gz
```

The contents should be tab-separated user IDs like this:

```
30127896763771792720650232247033613313	21129426
85306211943856228724087856539622954439	
07806796378672369654257787343739893690	
45555178101156754111785665766090475118	13968984
```

Some columns won't contain the Marketo ID because it hasn't been populated yet. This is useful later on. I saved the unzipped file as `example-data-feed.tsv` in my project for testing.

## Authentication

Assuming you are wanting programmatic access, it is best to authenticate using the <abbr title="JSON Web Token">JWT</abbr> method [{{< externallink "Full documentation" "https://www.adobe.io/authentication/auth-methods.html#!AdobeDocs/adobeio-auth/master/JWT/JWT.md" >}}].

First, you will need a private/public key certificate to sign your JWT. On macOS and Linux, you can use the following command:

```
openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout private.key -out certificate_pub.crt
```

Be sure to save the key pair in a secure location.

Then you will create an integration with {{< externallink "Adobe I/O" "https://console.adobe.io/home" >}} following these steps:

* From their homepage choose "Create Integration"
* Choose "Access an API"
* Under Experience Cloud choose "Adobe Analytics" then "Service Account Integration"
* Finally, name your API, provide a description, upload the private key you generated earlier, and select the appropriate permission level
* The following screen has most of the information you need, be sure to retrieve your client secret as well

If you prefer visuals {{< externallink "Adobe's documentation" "https://www.adobe.io/authentication/auth-methods.html#!AdobeDocs/adobeio-auth/master/JWT/JWTCertificate.md" >}} is pretty good for this step. Their video on {{< externallink "using postman" "https://docs.adobe.com/content/help/en/analytics-learn/tutorials/apis/using-postman-to-make-adobe-analytics-2-0-api-requests.html" >}} is helpful as well.

Additionally, you will need your Company ID, which can be obtained from the {{< externallink "Adobe Analytics 2.0 Swagger documentation" "https://adobedocs.github.io/analytics-2.0-apis/" >}}. In the documentation:

* Click "Login" and follow the authentication flow
* Click "reports" then "POST /reports"
* Click "Try it out" in the top right of the panel
* Click "Execute"
* Get your Company ID from the Request URL

```
https://analytics.adobe.io/api/COMPANY_ID/reports
```

I stored this information in two configuration files to be referenced by my script later. I also included the private key in my repository. However, this should only be done on a local file. If working in a production environment, these files must be stored securely.

### `adobe_conf.json`
{{< highlight json >}}
{
	"adobe_api": "https://analytics.adobe.io/api/",
	"adobe_api_1-4": "https://api.omniture.com/admin/1.4/rest/",
	"company_id": "COMPANY_ID",
	"client_id": "CLIENT_ID",
	"client_secret": "CLIENT_SECRET",
}
{{< / highlight >}}

### `adobe_jwt_payload.json`
{{< highlight json >}}
{
	"iss": "ORGANIZATION_ID",
	"sub": "TECHNICAL_ACCOUNT_ID",
	"https://ims-na1.adobelogin.com/s/ent_analytics_bulk_ingest_sdk": true,
	"aud": "API_KEY"
}
{{< / highlight >}}

Once again, be sure to upload your private key as well, I used the name `private.key`.

## Create a Python environment

These are the dependencies you will need for this project: 

### `requirements.txt`
```
certifi==2020.4.5.1
cffi==1.14.0
chardet==3.0.4
cryptography==2.9
DateTime==4.3
idna==2.9
jwt==1.0.0
numpy==1.18.2
pandas==1.0.3
pycparser==2.20
python-dateutil==2.8.1
pytz==2019.3
requests==2.23.0
six==1.14.0
urllib3==1.25.8
zope.interface==5.1.0
```

You can copy these into a `requirements.txt` file and run the following command:

```
pip3 install -r requirements.txt --target package
```

## Generate an access token

Great, now you're ready to get your access token from Adobe. To read and write to JSON files, I first defined these helper functions:

{{< highlight python >}}
def read_file(file_name):
	f = open(file_name, 'r')
	contents = f.read()
	f.close()
	return contents

def write_file(file_name, contents):
	f = open(file_name, 'w')
	f.write(contents)
	f.close()

def read_json(file_name):
	return json.loads(read_file(file_name))

def write_json(file_name, data):
	write_file(file_name, json.dumps(data))
{{< / highlight >}}

Which you can use with the following code.

{{< highlight python >}}
def encode_jwt(payload, secret):
	# measured in seconds, + 30 * 60 is used to set a thirty minute expiration
	payload['exp'] = round(time.time()) + 30 * 60
	encoded_jwt = jwt.encode(payload, secret, algorithm='RS256')
	return encoded_jwt

def authenticate_adobe(callback):
	conf = read_json('adobe_conf.json')
	encoded_jwt = encode_jwt(read_json('adobe_jwt_payload.json'), read_file('private.key'))
	conf['jwt_token'] = encoded_jwt

	r = requests.post('https://ims-na1.adobelogin.com/ims/exchange/jwt/',
		headers={
			'Cache-Control': 'no-cache',
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		data=conf)
	data = r.json()

	access_token = {}
	access_token['access_token'] = data['access_token']

	write_json('adobe_access_token.json', access_token)
	return callback()
{{< / highlight >}}

The use of `callback` in `authenticate_adobe` is much more useful later. For now, you can test this by running

{{< highlight python >}}
authenticate_adobe(lambda: print('Authenticated'))
{{< / highlight >}}

and checking the contents of the `adobe_access_token.json` file that is generated.

To handle CSVs and TSVs in the following steps I chose to use `pandas`, which you can install using `pip`.

```
pip3 install pandas
```

## Collect external data

Before uploading to the Adobe Data Source, you will want to collect the user data that you will be uploading. It will need to be a data source that has the Adobe Analytics ID (or some other common key) included in it so you can sync data with the correct user.

In this case, I was collecting the Marketing Cloud Visitor ID in Marketo every time a user submitted a form on our website. I was able to use this to retrieve users from the Marketo API where the Marketing Cloud Visitor ID was known.

I started by parsing the data feed file with `pandas` to retrieve records where the Marketo ID wasn't set, and store the Marketing Cloud Visitor IDs in a JSON file.

{{< highlight python >}}
def store_mcvisid():
  df = pd.read_csv('example-data-feed.tsv',
    names=['MC Visitor ID', 'Marketo ID'], sep='\t', dtype=str)
  df.drop_duplicates(subset=None, inplace=True)
  usersdf = df[df['Marketo ID'].isnull()]
  users = list(usersdf['MC Visitor ID'].to_numpy())
  write_json('adobe_users_without_marketo_id.json', users)
{{< / highlight >}}

I then used this list of IDs to collect data from Marketo and store it in a file called `marketo_users.json`. I won't include the full code here because it involves {{< externallink "authenticating with Marketo" "https://developers.marketo.com/blog/authenticating-and-retrieving-lead-data-from-marketo-with-the-rest-api/" >}} and is outside of the scope of this article, but you can find it in {{< externallink "the repository" "https://github.com/joshuabradley012/adobe-datasource/blob/master/main.py" >}}.

The result was an array of user objects similar to this:

{{< highlight json >}}
[{
	"id": 23498710,
	"Adobe_Visitor_ID": "07806796378672369654257787343739893690",
	"Account_Type__c": "Customer",
	"Account_Segment__c": "Mid Market",
	"Account_Status2__c": "Closed",
	"leadStatus": "Converted by Email",
	"leadScore": 75,
	"Persona1__c": "IT",
	"demoRequested": false,
	"Company_Type_2_c__c": "Computer Repair"
}]
{{< / highlight >}}

Ensure that you have a corresponding eVar for each of the data points you want to collect prepared inside of Adobe Analytics.

## Create an upload file

Using the data source you just created, you can now use `pandas` to create the file you will upload to your Data Source. I'm going to create a TSV that could be uploaded via FTP directly, or parsed and uploaded using the Adobe Data Sources API.

{{< highlight python >}}
def create_upload_file():
  adobe_df = pd.read_csv('example-data-feed.tsv',
    names=['MC Visitor ID', 'Marketo ID'], sep='\t', dtype=str)
  adobe_df.drop_duplicates(subset=None, inplace=True)
  adobe_df = adobe_df[adobe_df['Marketo ID'].isnull()]
  adobe_df = adobe_df.drop(columns=['Marketo ID'])
  adobe_df = adobe_df.rename(
    columns={'MC Visitor ID':'transactionID'})

  marketo_users = read_json('marketo_users.json')
  # These are the columns from the Marketo User data
  marketo_df = pd.DataFrame(marketo_users,
    columns=[
      'Adobe_Visitor_ID',
      'id',
      'Account_Type__c',
      'Account_Segment__c',
      'Account_Status2__c',
      'leadStatus',
      'leadScore',
      'Persona1__c',
      'demoRequested',
      'Company_Type_2_c__c'])
  # Renaming to the correct eVar
  marketo_df = marketo_df.rename(
    columns={
      'Adobe_Visitor_ID':'transactionID',
      'id': 'Evar 22',
      'Account_Type__c':'Evar 23',
      'Account_Segment__c':'Evar 24',
      'Account_Status2__c':'Evar 25',
      'leadStatus':'Evar 26',
      'leadScore':'Evar 27',
      'Persona1__c':'Evar 28',
      'demoRequested':'Evar 29',
      'Company_Type_2_c__c':'Evar 30'})

  joined_df = pd.merge(adobe_df, marketo_df, on='transactionID')
  # These columns are necessary for the upload to work
  joined_df.insert(0, 'Date', datetime.strftime(date.today(), '%m/%d/%Y')+'/00/00/00')
  # This is the custom success event we created earlier
  joined_df.insert(2, 'Event 51', '1')
  joined_df.to_csv('datasource_upload.txt', sep='\t', index=False)
{{< / highlight >}}

Open the generated file to double-check and ensure the headers and column values are all correct. You should see something that looks like this:

```
Date	transactionID	Event 51	Evar 22	Evar 23	Evar 24	Evar 25	Evar 26	Evar 27	Evar 28	Evar 29	Evar 30
04/14/2020/00/00/00	29063113234101700153481294853045582891	1	20091422	Customer	Mid Market	Closed	Converted by Email	75.0	IT	False	Computer Repair
```

## Upload the Data Source

Finally! All of that and now we can make our upload to Adobe.

But you'll need three more things. The company name of your Adobe Analytics instance, your report suite ID, and the ID of your Data Source.

The company name is simply the name that shows in the top right of Adobe Analytics when you are logged in. With that, you can define a function to get data from the Adobe Analytics 1.4 API. And this will be used to collect your Data Source ID.

And your report suite ID can be found under "Admin > Report Suites".

{{< highlight python >}}
def get_adobe_1_4(endpoint, payload=None):
  if payload is None:
    payload={}

  conf = read_json('adobe_conf.json')
  token = read_json('adobe_access_token.json')['access_token']

  r = requests.post(url=conf['adobe_api_1-4']+endpoint,
    headers={
      'Accept': '*/*',
      'Authorization': 'Bearer ' + token,
      'X-ADOBE-DMA-COMPANY': 'COMPANY_NAME',
    },
    data=payload)
  data = r.json()

  if isinstance(data, Iterable) and 'error_description' in data and data['error_description'] == 'The access token provided has expired':
    return authenticate_adobe(lambda: get_adobe_1_4(endpoint, payload))
  else:
    return data
{{< / highlight >}}

Note how there is a recursive call made in `get_adobe_1_4` that will refresh your access token if it has expired.

Alright, now to get the Data Source ID you'll need to use their API like this

{{< highlight python >}}
def get_datasource_id():
  data = {
    'reportSuiteID': 'REPORT_SUITE_ID',
  }
  get_adobe_1_4('?method=DataSources.Get', json.dumps(data))
{{< / highlight >}}

`json.dumps` is used to format the data correctly even though the request is made using `data` instead of `json`. Thanks for that Adobe.

Anyways, that function will return a JSON object that contains the report suite ID. Now you can upload your file!

{{< highlight python >}}
def api_upload_adobe_datasource():
  adobe_df = pd.read_csv('datasource_upload.txt', sep='\t', dtype=str)
  data = {
    'columns': adobe_df.columns.values.tolist(),
    'dataSourceID': 'DATASOURCE_ID',
    'finished': 'true',
    'jobName': 'upload',
    'reportSuiteID': 'REPORT_SUITE_ID',
    'rows': adobe_df.replace(np.nan, '', regex=True).values.tolist()
  }
  get_adobe_1_4('?method=DataSources.UploadData', json.dumps(data))
{{< / highlight >}}

Keep in mind this assumes that you are uploading a single file with less than 10,000 rows. You can see the full documentation on how to use `DataSources.UploadData` with their {{< externallink "Github documentation" "https://github.com/AdobeDocs/analytics-1.4-apis/blob/master/docs/data-sources-api/methods/r_uploadDataDataSources.md" >}}.

You should now see this being processed by your Data Source in Adobe Analytics. Keep in mind that we manually attached the Marketo ID to this data source. This is useful for validation and necessary for any other user scoped eVars you want to see in association with the user data you just uploaded.

## What about Adobe Analytics 2.0?

With all the work you've done, you might as well play around with the Adobe Analytics 2.0 integration. You can do that using this function:

{{< highlight python >}}
def get_adobe_2_0(endpoint, payload=None):
  if payload is None:
    payload={}

  conf = read_json('adobe_conf.json')
  token = read_json('adobe_access_token.json')['access_token']

  r = requests.post(url=conf['adobe_api']+conf['company_id']+endpoint,
    headers={
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
      'x-api-key': conf['client_id'],
      'x-proxy-global-company-id': conf['company_id'],
    },
    json=payload)
  data = r.json()

  if 'error_code' in data and 'message' in data and data['message'] == 'Oauth token is not valid':
    return authenticate_adobe(lambda: get_adobe_2_0(endpoint, payload))
  else:
    return data
{{< / highlight >}}

## Next steps, put it on AWS

This is useful if you are doing this all locally, but ideally, you'll set up a job to run this automatically for you from the Data Feed you created.

This can be achieved with a Lambda on AWS with a CloudWatch task that fires it daily.

The following diagram includes a flow for a GUI that wasn't outlined here, so you can ignore that part. The rest should give you an idea of how this could be achieved.

{{< figure src="/images/marketing-data-integrations.svg" title="Data source on AWS" link="/images/marketing-data-integrations.svg" target="blank" >}}

Good luck! If you want to chat more about this, feel free to email me at <a href="mailto:hello@joshbradley.me">hello@joshbradley.me</a>.