// ==UserScript==
// @name         AWSConsoleBlocker
// @namespace    http://aws.amazon.com/
// @version      0.12
// @description  Mask PII data like AWS Account #s and IPs in the AWS Console.
// @author       kedouard@amazon.com
// @match        https://*.console.aws.amazon.com/*
// @grant        none
// @run-at       document-end
// @require 	https://cdnjs.cloudflare.com/ajax/libs/aws-sdk/2.1.35/aws-sdk.min.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    var myHTML = '<h1>{ICON}You\'re accessing a restricted account!</h1>' +
    '<p>{DOMAIN} is not a corporate account, so let\'s not go there.<p> If you think this is a mistake, please contact kedouard@';

    var myImageCode = '<span style="display: block; height: 180px; width: 180px; font-size: 144px; text-align: center; ' +
    'float: left; background-color: #f4f4f4; padding: 15px; border-radius: 100px; margin-right: 50px">&#x1f648;</span>';

    var myCSS = '<style>html, body {box-sizing: border-box; height: 100%; width: 100%; margin: 0; background-color: red; color: white; }' +
    'body {font-size: 36px; padding: 20px 30px;}</style>';

    // No need to customize below this line

    var domain = location.search.substr(location.search.indexOf('report=')+7);

    // Replace logged in principal, account name, and federated user:
    //document.querySelector("#nav-usernameMenu > div.nav-elt-label").innerHTML = "AWS Account";
    //document.querySelector("#awsc-login-display-name-account").innerHTML = "My AWS Account";
    //document.querySelector("#awsc-login-display-name-user").innerHTML = "AnyCompany/jdoe";
    let fedlogin = document.querySelector("div._1eDzC4Ojs40yEtM3010tpU").innerHTML.split(': ')[1];
    console.log("fedlogin: ",fedlogin);

    // Array of terms to replace, you can use Regular expressions.

    var replaceArry = [
        [/([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})/, 'johndoe@example.com'], // email address
        [/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)\ @/, 'johndoe @'], // Federated account name
        [fedlogin, 'John Doe'], // Federated account name
        // [/\d{4}\-\d{4}\-\d{4}/, '1234-5678-9012'], // 12 digit AWS Account #s with dash
        // [/\d{12}/, '123456789012'], // 12 digit AWS Account #s
        [/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, '10.24.34.0'], // IP Addresses
        [/\b\d{1,3}\-\d{1,3}\-\d{1,3}\-\d{1,3}\b/, '10-24-34-0'], // EC2 DNS CNAME IPs
        [/(^|[^A-Z0-9])[A-Z0-9]{20}(?![A-Z0-9])/, 'AIDACKCEVSQ6C2EXAMPLE'], // IAM Access Key ID
        // etc.
    ];
    var numTerms = replaceArry.length;
    console.log("numTerms: ", numTerms);
    //-- 5 times/second; Plenty fast.
    var transTimer = setInterval(translateTermsOnPage, 500);

    async function translateTermsOnPage() {
        /*--- Replace text on the page without busting links or javascript
        functionality.
    */
        var txtWalker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT, {
                acceptNode: function (node) {
                    //-- Skip whitespace-only nodes
                    if (node.nodeValue.trim()) {
                        if (node.tmWasProcessed)
                            return NodeFilter.FILTER_SKIP;
                        else
                            return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_SKIP;
                }
            },
            false
        );
        console.log("txtWalker: ", txtWalker);
        var txtNode = null;
        while (txtNode = txtWalker.nextNode()) {
            if (txtNode.nodeValue == "My Account")
            {
             var accountID = txtWalker.nextNode().nodeValue;
             console.log("ACCOUNTID IS XXXXX: ", accountID);
             try {
              console.log("going to fetch APIGW");
              const json = await fetch('https://dc7eyldrr7.execute-api.us-east-1.amazonaws.com/dev/checklist?id='+accountID, {mode: 'cors',headers: {"Access-Control-Allow-Origin": '*'}})
                 .then(response => response.json());
                 console.log("After fetch");
                 console.log("status: ", json);
                 if (json === "non-approved")
                 {
                     console.log("WAS NON APPROVED: ", json);
                     document.body.innerHTML = myHTML.replace('{DOMAIN}', accountID).replace('{ICON}', myImageCode) + '\n' + myCSS;
                 }
                 else console.log("WAS APPROVED: ", json);
             }
             catch (err){
                 console.log("error: ",err)
             }

             }
            console.log("txtNode: ", txtNode);
            txtNode.nodeValue = replaceAllTerms(txtNode.nodeValue);
            txtNode.tmWasProcessed = true;
        }
        //
        //--- Now replace user-visible attributes.
        //
        var placeholderNodes = document.querySelectorAll("[placeholder]");
        replaceManyAttributeTexts(placeholderNodes, "placeholder");

        var titleNodes = document.querySelectorAll("[title]");
        replaceManyAttributeTexts(titleNodes, "title");
    }

    function replaceAllTerms(oldTxt) {
        for (var J = 0; J < numTerms; J++) {
            oldTxt = oldTxt.replace(replaceArry[J][0], replaceArry[J][1]);
        }
        return oldTxt;
    }

    function replaceManyAttributeTexts(nodeList, attributeName) {
        for (var J = nodeList.length - 1; J >= 0; --J) {
            var node = nodeList[J];
            var oldText = node.getAttribute(attributeName);
            if (oldText) {
                oldText = replaceAllTerms(oldText);
                node.setAttribute(attributeName, oldText);
            } else
                throw "attributeName does not match nodeList in replaceManyAttributeTexts";
        }
    }

})();
