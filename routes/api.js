var fs = require('fs');

/*
 * 文章列表数据
 */
exports.articlelist = function(req, res) {
  // 文件夹路径
  var fileDirectory = "articles/";
  // 获取文章数据
  var articleDatas = Object.assign([], require('../data/articles.json'));
  // 将文章数据倒序
  articleDatas.reverse();
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
exports.posttag = function(req, res) {
  // 获取文章数据
  const articleDatas = copyArr(require('../data/post.json'));
  var arr = [];
  articleDatas.forEach(function(postData, index) {
    var postTagText = [];
    postData.postTags.forEach(function(postTag, index) {
      postTagText.push(postTag.text);
    });
    arr = arr.concat(postTagText);
  });
  const map = arr.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map());
  // 去重数组
  const newArr = Array.from(map.keys());
  const result = [];
  newArr.forEach(function(elem, index) {
    const data = {};
    data.text = elem;
    data.link = 'https://rekodsc.com/tag/' + elem + '/';
    // data.link = '#!/tag/'+elem+'/';
    data.count = map.get(elem);
    data.weight = Math.floor(Math.random() * 9 + 16);
    result.push(data);
  });
  res.send(result);
};
