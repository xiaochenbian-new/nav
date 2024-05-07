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
                    message: '请复制Java实体',
                    type: 'error',
                    center: true
                })
            }


            //获取表名
            const jsonObj = {};

            const lines = str.split('\n');
            let className = '';
            let isFieldBlock = false;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                if (line.startsWith('public class')) {
                    const startIndex = line.indexOf('class') + 5;
                    const endIndex = line.indexOf('{');
                    className = line.substring(startIndex, endIndex).trim();
                } else if (line.startsWith('private') && line.includes(';')) {
                    const parts = line.trim().split(' ');
                    const type = parts[1];
                    const fieldName = parts[2].replace(';', '');
                    jsonObj[fieldName] = this.getDefaultValue(type);
                    isFieldBlock = true;
                } else if (line.endsWith(';')) {
                    isFieldBlock = false;
                }

            }

            //最终结果
            this.res = JSON.stringify(jsonObj, null, 2);
        },
        getDefaultValue(type) {
            if (type === 'boolean') {
                return false;
            } else if (type === 'int' || type === 'Integer') {
                return 0;
            } else if (type === 'double' || type === 'Double' || type === 'float' || type === 'Float') {
                return 0.0;
            } else if (type === 'List<Object>') {
                return [];
            } else {
                return null;
            }
        }
    }
})

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});