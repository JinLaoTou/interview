/**
 * 树形结构转换为列表结构
 * @param {Array} data 
 * @returns 
 */
function treeToList(data) {
    let res = [];
    const dfs = (tree) => {
      tree.forEach((item) => {
        if (item.children) {
          dfs(item.children);//如果有子元素，就递归遍历
          delete item.children;
        }
        res.push(item);//塞进数组
      });
    };
    dfs(data);
    return res;
  }
  let data = [
    {
        id: 1,
        text: '节点1',
        parentId: 0,
        children: [
            {
                id:2,
                text: '节点1_1',
                parentId:1
            }
        ]
    }
]

// console.log(treeToList(data));

/**
 * 列表转换为数组
 * @param {Array} data 
 * @returns 
 */
function listToTree(data) {
    let temp = {};
    let treeData = [];
    for (let i = 0; i < data.length; i++) {
      temp[data[i].id] = data[i];
    }
    for (let i in temp) {
      if (+temp[i].parentId != 0) {
        if (!temp[temp[i].parentId].children) {
          temp[temp[i].parentId].children = [];
        }
        temp[temp[i].parentId].children.push(temp[i]);
      } else {
        treeData.push(temp[i]);
      }
    }
    return treeData;
  } 
  let list = [
    {
        id: 1,
        text: '节点1',
        parentId: 0 //这里用0表示为顶级节点
    },
    {
        id: 2,
        text: '节点1_1',
        parentId: 1 //通过这个字段来确定子父级
    },
    {
        id: 3,
        text: '节点1_2',
        parentId: 2 //通过这个字段来确定子父级
    }
]
console.log(listToTree(list));