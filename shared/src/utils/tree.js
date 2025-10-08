/**
 * 树形数据处理工具函数
 */

/**
 * 将列表转换为树形结构
 * @param {Array} list - 列表数据
 * @param {Object} options - 配置选项
 * @returns {Array} 树形数据
 */
export function listToTree(list, options = {}) {
  const {
    id = 'id',
    parentId = 'parentId',
    children = 'children',
    rootValue = null
  } = options

  const tree = []
  const map = {}

  // 创建映射
  list.forEach(item => {
    map[item[id]] = { ...item, [children]: [] }
  })

  // 构建树
  list.forEach(item => {
    const node = map[item[id]]
    const parent = map[item[parentId]]

    if (item[parentId] === rootValue || !parent) {
      tree.push(node)
    } else {
      parent[children].push(node)
    }
  })

  return tree
}

/**
 * 将树形结构转换为列表
 * @param {Array} tree - 树形数据
 * @param {Object} options - 配置选项
 * @returns {Array} 列表数据
 */
export function treeToList(tree, options = {}) {
  const {
    children = 'children'
  } = options

  const list = []

  function traverse(nodes) {
    nodes.forEach(node => {
      const { [children]: kids, ...rest } = node
      list.push(rest)

      if (kids && kids.length > 0) {
        traverse(kids)
      }
    })
  }

  traverse(tree)
  return list
}

/**
 * 查找树节点
 * @param {Array} tree - 树形数据
 * @param {Function} predicate - 查找条件
 * @param {Object} options - 配置选项
 * @returns {Object|null} 找到的节点
 */
export function findNode(tree, predicate, options = {}) {
  const { children = 'children' } = options

  function traverse(nodes) {
    for (const node of nodes) {
      if (predicate(node)) {
        return node
      }

      if (node[children] && node[children].length > 0) {
        const found = traverse(node[children])
        if (found) {
          return found
        }
      }
    }
    return null
  }

  return traverse(tree)
}

/**
 * 查找节点路径
 * @param {Array} tree - 树形数据
 * @param {Function} predicate - 查找条件
 * @param {Object} options - 配置选项
 * @returns {Array} 节点路径
 */
export function findPath(tree, predicate, options = {}) {
  const { children = 'children' } = options

  function traverse(nodes, path = []) {
    for (const node of nodes) {
      const currentPath = [...path, node]

      if (predicate(node)) {
        return currentPath
      }

      if (node[children] && node[children].length > 0) {
        const found = traverse(node[children], currentPath)
        if (found) {
          return found
        }
      }
    }
    return null
  }

  return traverse(tree) || []
}

/**
 * 过滤树节点
 * @param {Array} tree - 树形数据
 * @param {Function} predicate - 过滤条件
 * @param {Object} options - 配置选项
 * @returns {Array} 过滤后的树
 */
export function filterTree(tree, predicate, options = {}) {
  const { children = 'children' } = options

  function traverse(nodes) {
    return nodes
      .filter(predicate)
      .map(node => ({
        ...node,
        [children]: node[children] ? traverse(node[children]) : []
      }))
  }

  return traverse(tree)
}

/**
 * 遍历树节点
 * @param {Array} tree - 树形数据
 * @param {Function} callback - 回调函数
 * @param {Object} options - 配置选项
 */
export function traverseTree(tree, callback, options = {}) {
  const { children = 'children' } = options

  function traverse(nodes, parent = null, level = 0) {
    nodes.forEach((node, index) => {
      callback(node, parent, level, index)

      if (node[children] && node[children].length > 0) {
        traverse(node[children], node, level + 1)
      }
    })
  }

  traverse(tree)
}

/**
 * 获取所有叶子节点
 * @param {Array} tree - 树形数据
 * @param {Object} options - 配置选项
 * @returns {Array} 叶子节点列表
 */
export function getLeafNodes(tree, options = {}) {
  const { children = 'children' } = options
  const leaves = []

  function traverse(nodes) {
    nodes.forEach(node => {
      if (!node[children] || node[children].length === 0) {
        leaves.push(node)
      } else {
        traverse(node[children])
      }
    })
  }

  traverse(tree)
  return leaves
}
