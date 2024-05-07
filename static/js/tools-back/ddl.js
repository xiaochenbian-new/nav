document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

const app = new Vue({
    el: '#app',
    data() {
        return {
            pre: '',
            res: ''
        }
    },
    methods: {
        convert() {
            const str = this.pre
            //为空判断
            if (str == '') {
                this.$message({
                    message: '请复制mysql ddl 语句',
                    type: 'error',
                    center: true
                })
            }

            //定义实体类与数据字段对应类型
            const map = new Map([
                //字符串
                ["char", "String"],
                ["varchar", "String"],
                ["tinytext", "String"],
                ["text", "String"],
                ["longtext", "String"],
                //时间日期
                ["date", "String"],
                ["time", "String"],
                ["datetime", "String"],
                ["timestamp", "String"],
                ["year", "String"],
                //数值类型
                ["tinyint", "Integer"],
                ["smallint", "Integer"],
                ["mediumint", "Integer"],
                ["int", "Integer"],
                ["bigint", "Long"],
                ["long", "Long"],
                ["float", "Float"],
                ["double", "Double"],
                ["decimal", "BigDecimal"]
            ]);


            //获取表名
            const array = str.split("\n");
            let tableName = "tableName";
            if (array[0].includes("TABLE")) {
                tableName = /`\w+`/.exec(array[0]).toString().replaceAll("`", "");
            }

            //1.获取所有字段
            let sqlColumns = "所有字段：\n";
            //2.查询所有字段
            let selectSql = "查询所有字段SQL：\nselect\n";
            //3.java实体类
            let pojoClass = "实体类：\npublic class " + toHump(tableName).charAt(0).toUpperCase() + toHump(tableName).slice(1) + "{\n";

            // ============================== mybatis相关 =======================================
            // 4.base_column
            let baseColumn = "base_column: \n" + "<sql id=\"base_column\">\n";
            // 5.resultMap
            let resultMap = "resultMap: \n" + "<resultMap id=\"base_column_map\" type=\"实体类\">\n";
            // 6.updateSql
            let updateSql = "updateSql语句：\nupdate " + tableName + "\n<set>\n";
            // 7.insertSql
            let insertPrefix = "insertSql语句：\ninsert into " + tableName + "(";
            let insertSuffix = " values \n<foreach collection=\"list\" item=\"em\" separator=\",\">\n\0\0\0\0 (";

            array.map(row => {
                //获取包含字段的每一行
                if (row.includes("`") && !row.includes("CREATE") && !row.includes("KEY")) {
                    const rowArr = row.trim().split(" ");
                    //1.设置所有字段
                    sqlColumns = sqlColumns + rowArr[0] + ",";
                    //2.设置查询的所有字段语句
                    selectSql = selectSql + "\0\0\0\0" + rowArr[0] + " as " + toHump(rowArr[0]) + ",\n";
                    //3.java 实体类
                    //获取注释
                    var annotation = /COMMENT.*/.exec(row);
                    if (annotation != "" && annotation != null) {
                        annotation = "//" + annotation.toString().replaceAll("COMMENT", "").replaceAll(",", "").replaceAll("'", "")
                    } else {
                        annotation = "";
                    }
                    //获取字段类型
                    var columnType = /[A-Za-z]+/.exec(rowArr[1]);
                    //设置实体类
                    pojoClass = pojoClass + "\0\0\0\0private " + (map.get(columnType.toString()) === "" ? "undefined " : map.get(columnType.toString()) + " ")
                        + toHump(rowArr[0]) + "; " + annotation + "\n";

                    // 4.base_column
                    baseColumn = baseColumn + "\0\0\0\0" + rowArr[0] + ",\n";
                    // 5.resultMap
                    resultMap = resultMap + "\0\0\0\0" + "<result column=\""+ rowArr[0] + "\" property=\""+ toHump(rowArr[0]) + "\" />\n";
                    // 6.updateSql
                    updateSql = updateSql + "\0\0\0\0" +
                        "<if test=\""+ (map.get(columnType.toString()) === "String"
                            ? toHump(rowArr[0]) + " != null and " + toHump(rowArr[0]) + " != ''"
                            : toHump(rowArr[0]) + " != null") + "\">" + rowArr[0]
                        + " = #{" + toHump(rowArr[0]) + "},</if>\n";
                    // 7.insertSql
                    insertPrefix = insertPrefix + rowArr[0] + ",";
                    insertSuffix = insertSuffix + "#{em." + toHump(rowArr[0]) + "}, ";
                }
            })

            //处理结尾
            //1.所有字段
            var s1 = sqlColumns.toString().replaceAll("`", "");
            sqlColumns = s1.substring(0, s1.lastIndexOf(",")) + "\n";
            //2.查询所有字段
            var s2 = selectSql.toString().replaceAll("`", "");
            selectSql = s2.substring(0, s2.lastIndexOf(",")) + "\nfrom " + tableName;
            //3.java 实体类
            pojoClass = pojoClass.toString().replaceAll("`", "") + "}";

            // 4.base_column
            var s3 = baseColumn.toString().replaceAll("`", "");
            baseColumn = s3.substring(0,s3.lastIndexOf(",\n")) + "\n</sql>"
            // 5.resultMap
            var s4 = resultMap.toString().replaceAll("`", "");
            resultMap = s4 + "</resultMap>"
            // 6.updateSql
            var s5 = updateSql.toString().replaceAll("`", "");
            updateSql = s5 + "</set>\nwhere xxx条件"
            // 7.insertSql
            insertPrefix = insertPrefix.toString().substring(0, insertPrefix.toString().lastIndexOf(",")) + ")";
            insertPrefix = insertPrefix.toString().replaceAll("`","");
            insertSuffix = insertSuffix.toString().substring(0, insertSuffix.toString().lastIndexOf(",")) + ")\n</foreach>";
            insertSuffix = insertSuffix.toString().replaceAll("`","")

            //最终结果
            this.res = sqlColumns + "\n" + selectSql + "\n\n" + pojoClass +
                "\n\n===================== mybatis 相关 ====================\n"
                + baseColumn + "\n\n" + resultMap + "\n\n" + updateSql + "\n\n"
                + insertPrefix + insertSuffix;
        }
    }
})

//下划线转驼峰
function toHump(name) {
    return name.replace(/\_(\w)/g, function (all, letter) {
        return letter.toUpperCase();
    })
}