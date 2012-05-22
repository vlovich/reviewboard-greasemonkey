// ==UserScript==
// @name Reviewboard Dashboard Enhancement
// @namespace https://github.comcom/vlovich
// @description Make the dashboard links available from reviews
// @include https://review.mydomain.com/*
// ==/UserScript==

// greasemonkey workaround for http://code.google.com/p/reviewboard/issues/detail?id=2607

function main() {
    EXPECTED_HOSTNAME = "review.mydomain.com"

    function injectCss() {
        var css = document.createElement("style");
        css.textContent =
        "#navbar-enhanced-navigation {                \n" +
        "    background-color: #C6DCF3;               \n" +
        "    border: 1px #3465A4 solid;               \n" +
        "    list-style: none;                        \n" +
        "    margin: 0;                               \n" +
        "    padding: 9px 6px;                        \n" +
        "}                                            \n" +
        "#navbar-enhanced-navigation li {             \n" +
        "    display: inline;                         \n" +
        "    height: 30px;                            \n" +
        "    margin-right: 14px;                      \n" +
        "}";
        document.body.appendChild(css);
    }

    function enhanceNavbar() {
        console.log("enhancing " + document.location.host + " @ " + document.location.pathname);

        // this is the high-level navbar <ul> ('My Dashboard', 'New Review Request', etc)
        navbar_list = $("#navbar");

        // create the element for the enhanced navbar
        navbar_enhancement = $(document.createElement("ul"));
        navbar_enhancement.attr({
            id: "navbar-enhanced-navigation"
        });

        updateDashboard(navbar_enhancement);
        navbar_list.parent().append(navbar_enhancement);
    }

    function updateDashboard(navbar_enhancement) {
        console.log("fetched dashboard from " + document.location.origin + "/dashboard");
        $.ajax({
            url: document.location.origin + "/dashboard",
            success: function(data) {
                navbar_enhancement.empty();

                console.log("fetched dashboard");
                var dashboardHtml = $(data);
                var dashboardNavbar = $("#dashboard-navbar", dashboardHtml);
                var dashboardLinks = $('a', dashboardNavbar);
                dashboardLinks.each(function(index, linkEl) {
                    var container = $(this).parent();
                    var count = container.next().text();

                    var injectedLinkEl = $(document.createElement('a'));
                    injectedLinkEl.attr({
                        href: linkEl.href,
                    });
                    injectedLinkEl.text(linkEl.text + " (" + count + ")");
                    injectedLinkEl.attr('class', $(container).attr('class'));

                    var injectedLinkEntry = $(document.createElement('li'));
                    injectedLinkEntry.append(injectedLinkEl);
                    injectedLinkEntry.appendTo(navbar_enhancement);
                });
            },
        });
    }

    if (document.location.host == EXPECTED_HOSTNAME) {
        if (document.location.pathname.match(/^\/r\//)) {
            // in review - enhance
            injectCss();
            enhanceNavbar();
            return;
        }
    }
    console.log("not enhancing " + document.location.host + " @ " + document.location.pathname);
}

function runInDocument(callback) {
    var script = document.createElement("script");
    script.textContent = "(" + callback.toString() + ")();";
    document.body.appendChild(script);
}
runInDocument(main);
