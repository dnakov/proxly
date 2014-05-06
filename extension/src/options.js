(function() {
/*
    {
        urls: {
                "https://*.salesforce.com/resource/*": {
                    regex: 'https.*\/resource(\/[0-9]+)?\/([A-Za-z0-9\-._]+\/)?',
                    regreplace: 'http://localhost:9000'
                },
                "https://*.force.com/resource/*": {
                    regex: 'https.*\/resource(\/[0-9]+)?\/([A-Za-z0-9\-._]+\/)?',
                    regreplace: 'http://localhost:9000'
                }

        }
    }

*/

    var urls = {};

    chrome.storage.sync.get(function(st) {
        urls = st.urls;
        refreshListItems();
    });

    var addUrl = function() {

        url = document.getElementById('newUrl').value;
        urls[url] = {
            regex: document.getElementById('newRegex').value,
            regreplace: document.getElementById('newReplace').value,
            cors: document.getElementById('newCors').value
        };
        syncStorage();

        refreshListItems(url);
    }

    var removeUrl = function(e) {
        var key = e.target.parentElement.getAttribute('data-key');
        delete urls[key];
        syncStorage();

        var el = e.target.parentElement;
        el.parentNode.removeChild(el);
    }

    var refreshListItems = function() {
        var lst = document.getElementById('urlList');
        while (lst.firstChild) lst.removeChild(lst.firstChild);

        lst.appendChild(addHeader());

        for (var key in urls) {
            var listItem = document.createElement('div');
            listItem.setAttribute('data-key', key);
            var elUrl = document.createElement('input');
            elUrl.value = key;
            elUrl.disabled = 'disabled';
            listItem.appendChild(elUrl);

            var elRegex = document.createElement('input');
            elRegex.type = 'text';
            elRegex.value = urls[key].regex;
            elRegex.setAttribute('data-attr', 'regex');
            listItem.setAttribute('data-attr', key);
            listItem.appendChild(elRegex);

            var elReplace = document.createElement('input');
            elReplace.type = 'text';
            elReplace.value = urls[key].regreplace;
            elReplace.setAttribute('data-attr', 'regreplace');
            listItem.appendChild(elReplace);

            var elReplace = document.createElement('input');
            elReplace.type = 'checkbox';
            elReplace.checked = urls[key].cors;
            elReplace.setAttribute('data-attr', 'cors');
            listItem.appendChild(elReplace);

            var elBtnRemove = document.createElement('button');
            elBtnRemove.innerText = 'Remove';
            elBtnRemove.onclick = removeUrl;
            listItem.appendChild(elBtnRemove);

            lst.appendChild(listItem);
        };

        lst.appendChild(addNew());

        document.getElementById('save').onclick = save;
    }

    var addHeader = function() {
        var li = document.createElement('div');
        li.className = 'li-header';
        li.innerHTML =
        '<span><strong>Match Pattern<a href="https://developer.chrome.com/extensions/match_patterns">(?)</a></strong></span>' +
        '<span><strong>RegExp OR full URL to match</strong></span>' +
        '<span><strong>Replace match with</strong></span>' +
        '<span class="cors"><strong>CORS</strong></span>';
        return li;
    }

    var addNew = function() {
        var listItem = document.createElement('div');
        var elUrl = document.createElement('input');
        elUrl.type = 'text';
        elUrl.id = 'newUrl';
        listItem.appendChild(elUrl);

        var elRegex = document.createElement('input');
        elRegex.type = 'text';
        elRegex.id = 'newRegex';
        listItem.appendChild(elRegex);

        var elReplace = document.createElement('input');
        elReplace.type = 'text';
        elReplace.id = 'newReplace';
        listItem.appendChild(elReplace);

        var elCors = document.createElement('input');
        elCors.type = 'checkbox';
        elCors.id = 'newCors';
        elCors.checked = true;
        listItem.appendChild(elCors);

        var elBtnAdd = document.createElement('button');
        elBtnAdd.innerText = 'Add';
        elBtnAdd.onclick = addUrl;
        listItem.appendChild(elBtnAdd);
        return listItem;
    }

    var syncStorage = function() {
        chrome.storage.sync.set({urls: urls});
    }

    var save = function() {
        for (var key in urls) {
            urls[key].regex = document.querySelectorAll('[data-key="' + key + '"] > [data-attr="regex"]')[0].value;
            urls[key].regreplace = document.querySelectorAll('[data-key="' + key + '"] > [data-attr="regreplace"]')[0].value;
            urls[key].cors = document.querySelectorAll('[data-key="' + key + '"] > [data-attr="cors"]')[0].checked;
        };
        syncStorage();
    }



})();

