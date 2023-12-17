const Mock = require('mockjs')

const List = []
const count = 100

const baseContent = '<p>I am testing data, I am testing data.</p><p><img src="https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943"></p>'
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

List.push({
  code: '001',
  pcode: '',
  name: '第一中学',
  addr: '广东省',
  www: 'www.school.edu',
  email: 'mail.school.edu',
  levle: '',
  type: '',
  level1: '',
  tel: '',
  leader: '孙道文',
  leaderTel: '',
  contact: '张盛军',
  contactTel: '',
  tecNum: 100,
  stuNum: 1000,
  num1: 2,
  num2: 2,
  exam: 0,
  content: '市第一中学初中部校本部',
  remark: '第一中学（初中部校本部）'
})

module.exports = [
  {
    url: '/sch/querySchool',
    type: 'get',
    response: config => {
      const { importance, type, title, page = 1, limit = 20, sort } = config.query

      let mockList = List.filter(item => {
        if (importance && item.importance !== +importance) return false
        if (type && item.type !== type) return false
        if (title && item.title.indexOf(title) < 0) return false
        return true
      })

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        res: {
          total: mockList.length,
          rows: pageList
        }
      }
    }
  },

  {
    url: '/sch/getSchool',
    type: 'get',
    response: config => {
      const { id } = config.query
      for (const article of List) {
        if (article.id === +id) {
          return {
            code: 20000,
            data: article
          }
        }
      }
    }
  },
  {
    url: '/sch/editSchool',
    type: 'post',
    response: config => {
      return {
        code: 20000,
        res: 'success'
      }
    }
  }
]

