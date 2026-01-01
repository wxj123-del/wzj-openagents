import type { BusinessProcess } from '@/types'

export const businessData: BusinessProcess[] = [
  {
    id: 'id-card-new',
    name: '身份证首次申领',
    category: '公安',
    description: '年满16周岁的中国公民应当自年满十六周岁之日起三个月内,向常住户口所在地的公安机关申请领取居民身份证。',
    estimatedTime: '20个工作日',
    icon: 'Postcard',

    steps: [
      {
        order: 1,
        title: '预约取号',
        description: '通过政务大厅微信公众号或现场取号机预约',
        location: '1号楼自助服务区',
        required: true
      },
      {
        order: 2,
        title: '窗口受理',
        description: '到指定窗口提交申请材料',
        location: '1号楼2层公安窗口',
        required: true
      },
      {
        order: 3,
        title: '信息采集',
        description: '采集指纹信息和人像照片',
        location: '1号楼2层公安窗口',
        required: true
      },
      {
        order: 4,
        title: '缴纳费用',
        description: '首次申领免费,到期换领20元',
        location: '1号楼1层缴费处',
        required: true
      },
      {
        order: 5,
        title: '领取证件',
        description: '可选择自领或邮寄到家',
        location: '1号楼1层发证窗口',
        required: true
      }
    ],

    materials: [
      {
        name: '居民户口簿',
        required: true,
        format: ['原件', '复印件'],
        remark: '需复印户主页和本人页'
      },
      {
        name: '本人到场',
        required: true,
        format: [],
        remark: '必须本人亲自办理'
      }
    ],

    notes: [
      '未满16周岁公民自愿申请居民身份证的,由监护人代为申请',
      '公民在申请领取、换领、补领居民身份证期间,急需使用居民身份证的,可以申请领取临时居民身份证'
    ],

    policies: [
      {
        title: '《中华人民共和国居民身份证法》',
        content: '第二条 居住在中华人民共和国境内的中国公民,在申请领取、换领、补领居民身份证期间,急需使用居民身份证的,可以申请领取临时居民身份证。'
      }
    ]
  },
  {
    id: 'social-security',
    name: '社保缴纳',
    category: '人社',
    description: '社会保险是国家通过立法强制建立的社会保障制度,包括养老保险、医疗保险、失业保险、工伤保险和生育保险。',
    estimatedTime: '即时办理',
    icon: 'Wallet',

    steps: [
      {
        order: 1,
        title: '办理社保卡',
        description: '携带身份证和照片到社保窗口办理',
        location: '2号楼1层社保窗口',
        required: true
      },
      {
        order: 2,
        title: '选择缴费档次',
        description: '根据个人情况选择合适的缴费档次',
        location: '2号楼1层社保窗口',
        required: true
      },
      {
        order: 3,
        title: '签订扣款协议',
        description: '与银行签订代扣代缴协议',
        location: '2号楼1层银行窗口',
        required: true
      },
      {
        order: 4,
        title: '完成缴费',
        description: '通过银行代扣或现场缴费',
        location: '2号楼1层缴费处',
        required: true
      }
    ],

    materials: [
      {
        name: '身份证',
        required: true,
        format: ['原件', '复印件'],
        remark: '需在有效期内'
      },
      {
        name: '一寸照片',
        required: true,
        format: ['原件'],
        remark: '白底彩色,2张'
      },
      {
        name: '银行卡',
        required: true,
        format: ['原件'],
        remark: '用于代扣代缴'
      }
    ],

    notes: [
      '社保卡需本人亲自办理',
      '缴费档次一旦选择,年度内不得变更',
      '建议每月按时缴费,避免断缴影响待遇'
    ],

    policies: [
      {
        title: '《中华人民共和国社会保险法》',
        content: '第十条 职工应当参加基本养老保险、基本医疗保险、工伤保险、失业保险和生育保险,由用人单位和职工共同缴纳基本养老保险费、基本医疗保险费和失业保险费。'
      }
    ]
  },
  {
    id: 'housefund-withdraw',
    name: '公积金提取',
    category: '公积金',
    description: '住房公积金提取是指缴存人符合规定条件时,将住房公积金账户内的存储余额取出的行为。',
    estimatedTime: '3-5个工作日',
    icon: 'CreditCard',

    steps: [
      {
        order: 1,
        title: '提交申请',
        description: '填写公积金提取申请表',
        location: '3号楼1层公积金窗口',
        required: true
      },
      {
        order: 2,
        title: '材料审核',
        description: '工作人员审核提取材料',
        location: '3号楼1层公积金窗口',
        required: true
      },
      {
        order: 3,
        title: '办理转账',
        description: '审核通过后办理转账手续',
        location: '3号楼1层公积金窗口',
        required: true
      },
      {
        order: 4,
        title: '资金到账',
        description: '资金转入指定银行账户',
        location: '',
        required: true
      }
    ],

    materials: [
      {
        name: '身份证',
        required: true,
        format: ['原件', '复印件'],
        remark: ''
      },
      {
        name: '公积金联名卡',
        required: true,
        format: ['原件'],
        remark: ''
      },
      {
        name: '购房合同或租房合同',
        required: true,
        format: ['原件', '复印件'],
        remark: '根据提取类型提供相应材料'
      }
    ],

    notes: [
      '每年可提取一次公积金',
      '提取金额不得超过实际发生费用',
      '租房提取每月最高2000元'
    ],

    policies: [
      {
        title: '《住房公积金管理条例》',
        content: '第二十四条 职工有下列情形之一的,可以提取职工住房公积金账户内的存储余额:(一)购买、建造、翻建、大修自住住房的;(二)离休、退休的;(三)完全丧失劳动能力,并与单位终止劳动关系的;(四)出境定居的;(五)偿还购房贷款本息的;(六)房租超出家庭工资收入的规定比例的。'
      }
    ]
  },
  {
    id: 'business-license',
    name: '营业执照注册',
    category: '市场监管',
    description: '个体工商户和企业办理营业执照,是开展经营活动的前提条件。',
    estimatedTime: '1-3个工作日',
    icon: 'Document',

    steps: [
      {
        order: 1,
        title: '名称核准',
        description: '提交企业名称预先核准申请',
        location: '4号楼2层市场监管窗口',
        required: true
      },
      {
        order: 2,
        title: '提交材料',
        description: '提交设立登记申请材料',
        location: '4号楼2层市场监管窗口',
        required: true
      },
      {
        order: 3,
        title: '审核发照',
        description: '审核通过后颁发营业执照',
        location: '4号楼2层市场监管窗口',
        required: true
      },
      {
        order: 4,
        title: '刻章备案',
        description: '办理公章、财务章等印章',
        location: '4号楼1层刻章窗口',
        required: false
      }
    ],

    materials: [
      {
        name: '经营者/法人身份证',
        required: true,
        format: ['原件', '复印件'],
        remark: ''
      },
      {
        name: '经营场所证明',
        required: true,
        format: ['原件', '复印件'],
        remark: '房产证或租赁合同'
      },
      {
        name: '公司章程',
        required: true,
        format: ['原件'],
        remark: '企业需提供'
      }
    ],

    notes: [
      '名称有效期6个月',
      '营业执照需每年年检',
      '变更登记需在30日内办理'
    ],

    policies: [
      {
        title: '《中华人民共和国市场主体登记管理条例》',
        content: '第十六条 申请办理市场主体登记,申请人应当提交申请书和相关材料,并对申请材料的真实性、合法性负责。'
      }
    ]
  },
  {
    id: 'tax-registration',
    name: '税务登记',
    category: '税务',
    description: '纳税人履行纳税义务时,需要向税务机关办理税务登记。',
    estimatedTime: '即时办理',
    icon: 'Tickets',

    steps: [
      {
        order: 1,
        title: '填写表格',
        description: '填写税务登记表',
        location: '5号楼1层税务窗口',
        required: true
      },
      {
        order: 2,
        title: '提交材料',
        description: '提交相关证明材料',
        location: '5号楼1层税务窗口',
        required: true
      },
      {
        order: 3,
        title: '领取证件',
        description: '领取税务登记证',
        location: '5号楼1层税务窗口',
        required: true
      }
    ],

    materials: [
      {
        name: '营业执照',
        required: true,
        format: ['原件', '复印件'],
        remark: ''
      },
      {
        name: '法人身份证',
        required: true,
        format: ['原件', '复印件'],
        remark: ''
      },
      {
        name: '公司章程',
        required: true,
        format: ['复印件'],
        remark: ''
      }
    ],

    notes: [
      '领取营业执照30日内办理',
      '纳税人识别号唯一',
      '变更登记需及时办理'
    ],

    policies: [
      {
        title: '《中华人民共和国税收征收管理法》',
        content: '第十五条 企业,企业在外地设立的分支机构和从事生产、经营的场所,个体工商户和从事生产、经营的事业单位(以下统称从事生产、经营的纳税人)自领取营业执照之日起三十日内,持有关证件,向税务机关申报办理税务登记。'
      }
    ]
  },
  {
    id: 'residence-transfer',
    name: '户口迁移',
    category: '公安',
    description: '公民因居住地发生变化,需要办理户口迁移手续。',
    estimatedTime: '5-10个工作日',
    icon: 'Location',

    steps: [
      {
        order: 1,
        title: '准备材料',
        description: '准备户口迁移所需材料',
        location: '',
        required: true
      },
      {
        order: 2,
        title: '办理准迁证',
        description: '到迁入地办理准迁证',
        location: '迁入地派出所',
        required: true
      },
      {
        order: 3,
        title: '办理迁移证',
        description: '到迁出地办理迁移证',
        location: '迁出地派出所',
        required: true
      },
      {
        order: 4,
        title: '办理落户',
        description: '到迁入地办理落户手续',
        location: '迁入地派出所',
        required: true
      }
    ],

    materials: [
      {
        name: '身份证',
        required: true,
        format: ['原件', '复印件'],
        remark: ''
      },
      {
        name: '户口簿',
        required: true,
        format: ['原件', '复印件'],
        remark: ''
      },
      {
        name: '房产证或租房合同',
        required: true,
        format: ['原件', '复印件'],
        remark: '证明迁入地居住条件'
      }
    ],

    notes: [
      '需先获得迁入地同意',
      '跨省迁移时间较长',
      '未成年人需监护人陪同'
    ],

    policies: [
      {
        title: '《中华人民共和国户口登记条例》',
        content: '第十条 公民迁出本户口管辖区,由本人或者户主在迁出前向户口登记机关申报迁出登记,领取迁移证件,注销户口。'
      }
    ]
  }
]

export const businessCategories = [
  { id: 'all', name: '全部业务', icon: 'Grid' },
  { id: '公安', name: '公安户政', icon: 'User' },
  { id: '人社', name: '社会保障', icon: 'UserFilled' },
  { id: '公积金', name: '住房公积金', icon: 'Wallet' },
  { id: '市场监管', name: '市场监管', icon: 'Shop' },
  { id: '税务', name: '税务服务', icon: 'Tickets' }
]
