var browser = browser || chrome;

function setChildTextNode(elementId, text) {
    document.getElementById(elementId).innerText = text;
}

function init() {
    document.title = browser.i18n.getMessage("extensionName") + ' - ' + browser.i18n.getMessage("textSettingsTitle");
    setChildTextNode('textSettingsTitle', browser.i18n.getMessage("textSettingsTitle"));
    setChildTextNode('textTitleWhitelist', browser.i18n.getMessage("textSettingsWhiteListTitle"));
    setChildTextNode('textWhitelistList', browser.i18n.getMessage("textSettingsWhiteListDescription"));
    setChildTextNode('buttonRemoveFromWhitelist', browser.i18n.getMessage("buttonRemoveFromWhitelist"));
    setChildTextNode('buttonRevokeAllTemp', browser.i18n.getMessage("buttonRevokeAllTemporary"));
    setChildTextNode('textVersionInfo', browser.i18n.getMessage("extensionName") + ' ' + (browser.app !== undefined ? browser.app.getDetails().version : ''));

    document.getElementById('buttonRemoveFromWhitelist').onclick = removeFromWhitelist;
    document.getElementById('buttonRevokeAllTemp').onclick = revokeAllTemporarilyAllowed;
    loadDomainList();
}

function revokeAllTemporarilyAllowed() {
    browser.runtime.sendMessage({type: REQ_REVOKE_FROM_TEMP_LIST}, function (response) {
        var data = {message: browser.i18n.getMessage("textRevokedFromTemp")};
        document.getElementById('options-snackbar').MaterialSnackbar.showSnackbar(data);
    });
}

function removeFromWhitelist() {
    var domains = getSelectedDomains();
    if (domains.length > 0) {
        browser.runtime.sendMessage({type: REQ_REMOVE_FROM_WHITELIST, list: domains});
    }
}

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.type) {
        case REQ_URLS_DEWHITELISTED:
            var data = {message: browser.i18n.getMessage("textRemovedFromWhitelist")};
            document.getElementById('options-snackbar').MaterialSnackbar.showSnackbar(data);
            loadDomainList();
            break;
    }
});

function getSelectedDomains() {
    var checkedBoxes = document.querySelectorAll('input[data-domain]:checked');

    var domains = [];
    checkedBoxes.forEach(function (elm) {
        var domain = elm.getAttribute('data-domain');
        domains.push(domain);
    });
    return domains;
}

function loadDomainList() {
    browser.storage.local.get('whiteListedDomains', function (object) {
        var domains = object.whiteListedDomains;
        displayWhitelistedDomains(domains);
    });
}

function displayWhitelistedDomains(domains) {

    document.getElementById('whitelist_list').innerHTML = '';
    document.getElementById('no_whitelisted_domains').innerText = '';

    if (!domains || domains.length === 0) {
        setChildTextNode('no_whitelisted_domains', browser.i18n.getMessage("textNoWhitelistedDomains"));
    } else {
        var container = document.getElementById('whitelist_list');
        var htmlTmpl = document.getElementById('template_list_item').innerHTML;
        domains.forEach(function (domain) {
            var punycodeDomain = punycode.toUnicode(domain);
            punycodeDomain = punycodeDomain.replace(/([^a-zA-Z0-9\-\.]+)/g, '<font color="red">$1</font>');
            var itemHtml = htmlTmpl.replace(/__DOMAIN_TEXT__/g, punycodeDomain);
            var itemHtml = itemHtml.replace(/__DOMAIN__/g, domain);
            var itemHtml = itemHtml.replace(/__LIST_ID__/g, hash(domain));
            container.innerHTML += itemHtml;
        });
    }
}

function hash(str) { // fast workaround
    var hash = 0;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

document.addEventListener('DOMContentLoaded', init);
