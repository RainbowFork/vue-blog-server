var fs = require('fs');

var compare = function(prop) {
  return function(obj1, obj2) {
    var val1 = obj1[prop];
    var val2 = obj2[prop];
    if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
      val1 = Number(val1);
      val2 = Number(val2);
    }
    if (val1 < val2) {
      return 1;
    } else if (val1 > val2) {
      return -1;
    } else {
      return 0;
    }
  }
}

//分割
var chunk = function(arr, size) {
  var array = arr;
  //获取数组的长度，如果你传入的不是数组，那么获取到的就是undefined
  const length = array.length
  //判断不是数组，或者size没有设置，size小于1，就返回空数组
  if (!length || !size || size < 1) {
    return []
  }
  //核心部分
  let index = 0 //用来表示切割元素的范围start
  let resIndex = 0 //用来递增表示输出数组的下标

  //根据length和size算出输出数组的长度，并且创建它。
  let result = new Array(Math.ceil(length / size))
  //进行循环
  while (index < length) {
    //循环过程中设置result[0]和result[1]的值。该值根据array.slice切割得到。
    result[resIndex++] = array.slice(index, (index += size))
  }
  //输出新数组
  // return result
  return result
}

// 抽离
var sortArr = function(arr, str) {
  var _arr = [],
    _t = [],
    // 临时的变量
    _tmp;
  // 按照特定的参数将数组排序将具有相同值得排在一起
  arr = arr.sort(function(a, b) {
    var s = a[str],
      t = b[str];

    return s > t ? -1 : 1;
  });
  if (arr.length) {
    // _tmp = arr[0][str];
    _tmp = new Date(arr[0][str]).getFullYear()
  }
  // 将相同类别的对象添加到统一个数组
  for (let i = 0; i < arr.length; i++) {
    if (new Date(arr[i][str]).getFullYear() === _tmp) {
      // if ( arr[i][str] === _tmp ){
      _t.push(arr[i]);
    } else {
      _tmp = new Date(arr[i][str]).getFullYear();
      _arr.push(_t);
      _t = [arr[i]];
    }
  }
  // 将最后的内容推出新数组
  _arr.push(_t);
  return _arr;
}

/*
 * 搜索列表数据
 */
exports.searchlist = function(req, res) {
  // 文件夹路径
  var fileDirectory = "articles/";
  // 获取文章数据
  var articleDatas = Object.assign([], require('../data/articles.json'));
  // 将文章数据倒序
  articleDatas.sort(function(a, b) {
    return (new Date(b.articleDate)) - (new Date(a.articleDate));
  });
  // 取得搜索关键字
  var keyword = req.query.keyword;
  // 保存返回数据对象
  var result = {};
  var archiveDatas = [];
  // 判断是否是标签
  if (keyword.substring(0,1) === '#') {
    keyword = keyword.substring(1);
    articleDatas.forEach(function(articleData, index) {
      for (var i = 0; i < articleData.articleTags.length; i++) {
        if (articleData.articleTags[i].articleTagName === keyword || keyword === '') {
          archiveDatas.push(articleData);
          break;
        }
      }
    });
  } else {
    articleDatas.forEach(function(articleData, index) {
      if (articleData.articleTitle.indexOf(keyword) > -1) {
        archiveDatas.push(articleData);
      }
    });
  }
  result.data = archiveDatas;
  result.ret = true;
  res.send(result);
};

/*
 * 归档列表数据
 */
exports.archivelist = function(req, res) {
  // 文件夹路径
  var fileDirectory = "articles/";
  // 获取文章数据
  var articleDatas = Object.assign([], require('../data/articles.json'));
  // 将文章数据倒序
  // articleDatas.reverse();
  articleDatas.sort(function(a, b) {
    return (new Date(b.articleDate)) - (new Date(a.articleDate));
  });
  // 获取文章总数
  var totalArticles = articleDatas.length;
  // 每页显示文章数
  var perPage = 10;
  // 取得当前页数
  var currentPage = req.query.page;
  // 求出当前页的起始文章位置
  var articleIndex = (currentPage - 1) * perPage;
  // 截取要显示的文章数据
  var perPageDatas = articleDatas.slice(articleIndex, articleIndex + perPage);
  // 求出总页数
  var totalPage;
  if (totalArticles % perPage === 0) {
    totalPage = totalArticles / perPage;
  } else {
    totalPage = (totalArticles - totalArticles % perPage) / perPage + 1;
  }
  var result = {};
  result.count = totalArticles;
  // 如果页数不是当前范围直接返回404
  if (currentPage < 1 || currentPage > totalPage) {
    res.status(404).send('Sorry cant find that!');
  } else {
    // var resultData = [];
    var cc = chunk(perPageDatas.sort(compare("articleDate")), perPage)
    var _cc = []
    for (let i = 0; i < cc.length; i++) {
      //抽离
      var _datas = sortArr(cc[i], 'articleDate')
      //根据所给数据结构进行赋值
      _cc.push([])
      for (let o = 0; o < _datas.length; o++) {
        _cc[i].push({
          archiveDate: new Date(_datas[o][0].articleDate).getFullYear(),
          archiveArticles: []
        })
      }
      for (let p = 0; p < _cc[i].length; p++) {
        _cc[i][p].archiveArticles = sortArr(cc[i], 'articleDate')[p]
      }
    }
    result.data = _cc;
    result.ret = true;
    res.send(result);
    // console.log(_cc);
  }
};

/*
 * 文章列表数据
 */
exports.articlelist = function(req, res) {
  // 文件夹路径
  var fileDirectory = "articles/";
  // 获取文章数据
  var articleDatas = Object.assign([], require('../data/articles.json'));
  // 将文章数据倒序
  // articleDatas.reverse();
  articleDatas.sort(function(a, b) {
    return (new Date(b.articleDate)) - (new Date(a.articleDate));
  });
  // 获取文章总数
  var totalArticles = articleDatas.length;
  // 每页显示文章数
  var perPage = 5;
  // 取得当前页数
  var currentPage = req.query.page;
  // 求出当前页的起始文章位置
  var articleIndex = (currentPage - 1) * perPage;
  // 截取要显示的文章数据
  var perPageDatas = articleDatas.slice(articleIndex, articleIndex + perPage);
  // 求出总页数
  var totalPage;
  if (totalArticles % perPage === 0) {
    totalPage = totalArticles / perPage;
  } else {
    totalPage = (totalArticles - totalArticles % perPage) / perPage + 1;
  }
  var filenames = [];
  var perPageFiles = [];
  var result = {};
  // 如果页数不是当前范围直接返回404
  if (currentPage < 1 || currentPage > totalPage) {
    res.status(404).send('Sorry cant find that!');
  } else {
    // 判断文件夹路径是否存在
    if (fs.existsSync(fileDirectory)) {
      fs.readdir(fileDirectory, function(err, files) {
        if (err) {
          console.log(err);
          return;
        }
        files.forEach(function(filename, index) {
          filenames.push(filename.split('.md')[0]);
        });
        filenames.sort(function(a, b) {
          return b - a;
        });
        perPageFiles = filenames.slice(articleIndex, articleIndex + perPage);
        var completedCount = 0;
        perPageFiles.forEach(function(filename, index) {
          fs.readFile(fileDirectory + filename + '.md', 'utf-8', function(err, data) {
            if (err) throw err;
            perPageDatas[index].articleContent = data.split('<!--more-->')[0];
            completedCount++;
            if (completedCount === perPageFiles.length) {
              result.count = totalArticles;
              result.data = perPageDatas;
              result.ret = true;
              res.send(result);
            }
          });
        });
      });
    } else {
      console.log(fileDirectory + "  Not Found!");
    }
  }
};

/*
 * 文章数据
 */
exports.article = function(req, res) {
  // 文件夹路径
  var fileDirectory = "articles/";
  var id = req.query.id;
  var articleDatas = Object.assign([], require('../data/articles.json'));
  var isArticleExist = false;
  // 判断文件夹路径是否存在
  if (fs.existsSync(fileDirectory)) {
    fs.readdir(fileDirectory, function(err, files) {
      if (err) {
        console.log(err);
        return;
      }
      files.forEach(function(filename, index) {
        if (filename === id + '.md') {
          isArticleExist = true;
          fs.readFile(fileDirectory + id + '.md', function(err, data) {
            if (err) throw err;
            articleDatas[id - 1].articleContent = data.toString();
            var result = {};
            result.data = articleDatas[id - 1]
            result.ret = true;
            res.send(result);
          });
        }
      });
      if (!isArticleExist) {
        res.status(404).send('Sorry cant find that!');
      }
    });
  } else {
    console.log(fileDirectory + "  Not Found!");
  }
};

/*
 * 关于页数据
 */
exports.about = function(req, res) {
  // 文件夹路径
  var fileDirectory = "about/";
  var articleData = {
    'articleId': 0,
    'articleTitle': '关于'
  };
  var isArticleExist = false;
  // 判断文件夹路径是否存在
  if (fs.existsSync(fileDirectory)) {
    fs.readdir(fileDirectory, function(err, files) {
      if (err) {
        console.log(err);
        return;
      }
      files.forEach(function(filename, index) {
        if (filename === 'about.md') {
          isArticleExist = true;
          fs.readFile(fileDirectory + 'about.md', function(err, data) {
            if (err) throw err;
            articleData.articleContent = data.toString();
            var result = {};
            result.data = articleData
            result.ret = true;
            res.send(result);
          });
        }
      });
      if (!isArticleExist) {
        res.status(404).send('Sorry cant find that!');
      }
    });
  } else {
    console.log(fileDirectory + "  Not Found!");
  }
};

/*
 * 文章分类
 */
exports.postcategory = function(req, res) {
  // 获取文章数据
  const articleDatas = copyArr(require('../data/post.json'));
  var arr = [];
  articleDatas.forEach(function(postData, index) {
    arr = arr.concat(postData.postCategories);
  });
  const map = arr.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map());
  // 去重数组
  const newArr = Array.from(map.keys());
  const result = [];
  newArr.forEach(function(elem, index) {
    const data = {};
    data.postCategoryName = elem;
    data.postCategoryCount = map.get(elem);
    result.push(data);
  });
  res.send(result);
};

/*
 * 文章标签
 */
exports.articletag = function(req, res) {
  // 获取文章数据
  const articleDatas = Object.assign([], require('../data/articles.json'));
  var arr = [];
  articleDatas.forEach(function(articleData, index) {
    var tag = [];
    articleData.articleTags.forEach(function(articleTag, index) {
      tag.push(articleTag.articleTagName);
    });
    arr = arr.concat(tag);
  });
  const map = arr.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map());
  // 去重数组
  const newArr = Array.from(map.keys());
  const result = {};
  result.data = newArr;
  result.ret = true;
  res.send(result);
};
