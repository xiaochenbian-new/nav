function parseJson() {
    var inputJson = document.getElementById("input-json").value;
    var json = JSON.parse(inputJson);

    var results = document.getElementById("output-results");
    results.innerHTML = "";

    json.entities[0].children.forEach(function (entity) {
        if (entity.entity.type === "Request") {
            var interfaceName = entity.entity.name;
            var interfaceUri = entity.entity.uri.path;
            var interfaceMethod = entity.entity.method.name;
            var interfaceParams = null;

            if (interfaceMethod === "GET") {
                interfaceParams = parseQueryParams(entity.entity.uri.query.items);
            } else if (entity.entity.body && entity.entity.body.textBody) {
                var textBody = entity.entity.body.textBody.replace(/\\n/g, "").replace(/\\\"/g, "\"");
                interfaceParams = JSON.stringify(JSON.parse(textBody), null, 4);
            }

            var resultElement = document.createElement("div");
            resultElement.innerHTML = "<h3>" + "## " + interfaceName + "</h3>" +
                "<p><strong>- 接口 URI:</strong> " + interfaceUri + "</p>" +
                "<p><strong>- 请求方式:</strong> " + interfaceMethod + "</p>" +
                "<p><strong>- 接口参数:</strong> <pre>" + interfaceParams + "</pre></p> <hr/>";

            results.appendChild(resultElement);
        }
    });
}

function parseQueryParams(queryParams) {
    var params = "";
    queryParams.forEach(function (param) {
        if (param.enabled) {
            params += param.name + "=" + param.value.replace(/^\"|\"$/g, "") + "<br>";
        }
    });
    return params;
}

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});