# serverless workflow backend changelog

## 1.0.8

* [QP-3200] Hotfix: Creating Invoice Workflow History records which help updating invoice when user is assigned to a new Role (#154)

## 1.0.7

* [QP-3177] Account creation error (#151)
* [QP-3155] Invalid behaviour related to mappings when a cost account is added (#150)
* [QP-3076] Publish mapping unlink issue (#144)
* feat: REST API GW to HTTP API GW migration with authorizer lambda
* refactor: removed req.user.permission fetching from db in auth middleware
* feat: added accept to cookieless endpoints
* refactor: review changes
* refactor: modified after review corrections
* refactor: cleaned up custom authorizer
* refactor: custom authorizer for local environment
* feat: custom authorize lambda

## 1.0.6

* Avoid deleted vat accounts for auto posting (#149)
* Merge pull request #148 from Qvalia/b/qp-3146
* Fixed the issue with general role validations 


## 1.0.5

* [QP-3001] When invoice is put on hold during To Sign status, button changes to APPROVE #140
* [QP-2971] Add fix when vat_summary not available #141
* [QP-3010] Mapping deleted issue #142
* [QP-3011] All chart of accounts delete issues #143
* [QP-3082] timeline record modified for release invoice #145
* [QP-3095] Read vat reverse charge from invoice level #146
* [QP-2863] assign previously assigned invoices to the user #147

## 1.0.0

[QP-2815] get line item dimensions #104
Chart of Accounts
[QP-1473] pre posting #107
[QP-2513] Assign unassigned Invoices #81

Bug fixes
Fixes for [QP-2844] [QP-2845] [QP-2864] [QP-2880] [QP-2885] #111

## 1.0.1

[QP-2975] function to get draft accounts #128
[QP-2970], [QP-2971], [QP-2972] COA auto posting #127
[QP-2964] Mappings saving error #124
[QP-2974] Upload chart of accounts using pre signed url #123
[QP-2962] duplicate accounts issue fixed #121
[QP-2948] Timer starting time issue fixed #120
[QP-2945] fixed #119
[QP-2909] - invoice general reassign #118
[QP-2864] fixed an issue with release invoice #117
Fix COA fails on no chart of account found #116
[QP-2891] fix: use reference for email check in assign user #115
Moved existency check to the up #114
[QP-2903] Issue Fixed #113
Unit tests fixes in mapping #112
Fixes for [QP-2844] [QP-2845] [QP-2864] [QP-2880] [QP-2885] #111
Added currency conversion to sign invoice #108

## 1.0.2

[QP-2973] Fixed #132
COA - Fix for needed invoice attributes missing #131
publish date issue in coa #133

## 1.0.3

Remove file field in pre signed url generation. #129
[QP-2961] - fixed the issue with my task duplicate invoices #130
[QP-2995] Mappings publish issue #137
[QP-3009] Fixed #136


## 1.0.4

[QP-2858] invoice id bug fix #139
Deleted mapping showing issue fix #138
