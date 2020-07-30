# Therlaa-Backend

Backend for an application which acts as a wrapper around the United Payment Interface (UPI) in order to trace transactions / billing between vendors and students via QR code in the NITT Campus.

## Features

* A unique QR code is generated for each transaction and is stored in the vendor's application. 
* The buyer can scan the QR code and makes payment via his favourite UPI app.
* Payment is marked done only when the receiver confirms it.
* One to One mapping of payments and bills which allows for verification of payment when required.
* Encrypted communications using a SHA Key Exchange.
