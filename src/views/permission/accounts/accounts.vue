<template>
    <div class="content">
      <Row>
        <Col style="padding-left: 5px;margin-bottom: 5px;">
          <span>用户名：</span>
          <Input style="width: 150px" clearable v-model="username" placeholder="请输入用户名"></Input>
          <span>状态：</span>
          <Select style="width: 100px" v-model="from" @on-change="getUsers">
            <Option v-for="(item, key) in fromList" :value="item.value" :key="key">{{item.title}}</Option>
          </Select>
          <div style="margin-left: 40px; display: inline-block;">
          <Button type="primary" icon="ios-search" @click="getUsers" v-if="g_perm('search')">搜索</Button>
            
          <Button type="info" icon="plus-round" style="margin-left: 10px;" @click="showEditModal(null, 0)" v-if="g_perm('add')">新增账户</Button>
          </div>
        </Col>
        <Table border :columns="tableColumns" :data="tableData"></Table>
      </Row>
      <Modal
        v-model="falg"
        :title="MTitle == 0 ? '新增角色' : '编辑角色'"
        :mask-closable="false"
        @on-cancel="cancel"
      >
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
          <FormItem label="用户名：" prop="username">
            <Input v-model="formValidate.username" placeholder="请输入用户名" :disabled="MTitle == 1"></Input>
          </FormItem>
          <FormItem label="手机号：" prop="phone_number">
            <Input v-model="formValidate.phone_number" placeholder="请输入手机号"></Input>
          </FormItem>
          <FormItem label="邮箱：" prop="email">
            <Input v-model="formValidate.email" placeholder="请输入邮箱"></Input>
          </FormItem>
          <FormItem label="密码：" prop="password" v-if="MTitle == 0">
            <Input v-model="formValidate.password" type="password" placeholder="请输入密码"></Input>
          </FormItem>
          <FormItem label="确认密码：" prop="confirmPassword" v-if="MTitle == 0">
            <Input v-model="formValidate.confirmPassword" type="password" placeholder="请再次输入密码"></Input>
          </FormItem>
          <FormItem label="用户状态">
            <i-switch v-model="formValidate.status" size="large">
              <span slot="open">正常</span>
              <span slot="close">禁用</span>
            </i-switch>
          </FormItem>
          <FormItem label="用户角色" prop='roleName'>
            <Select v-model="formValidate.roleName" @on-change="select(formValidate)">
              <!-- <Option value="">请选择</Option> -->
              <Option v-for="(item, key) in rolesList" :key="key" :value="item.rolename">{{item.rolename}}</Option>
            </Select>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="primary" size="large" @click="ok(MTitle)">确认</Button>
          <Button size="large" @click="cancel">取消</Button>
        </div>
      </Modal>
      <Modal
        v-model="modalStatusPwd"
        title="修改密码" 
        width="500" 
        @on-cancel="handleResetPwd"
      >
        <Form ref="formItemPwd" :model="formItemPwd" :rules="ruleValidatePwd" :label-width="80">
          <FormItem label="原始密码" prop="password">
            <Input v-model="formItemPwd.password" type="password" placeholder="请输入原始密码"></Input>
          </FormItem>
          <FormItem label="新密码" prop="newPassword">
            <Input v-model="formItemPwd.newPassword" type="password" placeholder="请输入新密码"></Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="primary" size="large" @click="handleSubmitPwd">确认</Button>
          <Button size="large" @click="handleResetPwd">取消</Button>
        </div>
      </Modal>
      <Col>
        <Page 
        class="pages"
        show-sizer 
        show-elevator
        show-total
        :total="totalCount" 
        :page-size-opts="pageSizeOpts"
        :page-size="pageSize" 
        :current="pageIndex"
        @on-page-size-change="changePageSize"
        @on-change="changePage"></Page>
      </Col>
    </div>
</template>

<script>
  import api from '@/api/permission'

  export default {
    data() {
      const validatorPwd = (rule, value, callback) => {
        if (value === '') {
          callback();
        } else {
          if (!(this.formValidate.confirmPassword === this.formValidate.password)) {
            callback(new Error('两次输入密码不一致'));
          }
          callback();
        }
      };
      return {
        username: '',
        from: '',
        fromList: [
          {
            value: '',
            title: '全部'
          },{
            value: 1,
            title: '正常'
          },{
            value: 0,
            title: '禁用'
          }
        ],
        tableColumns: [
          {
            title: '用户名',
            key: 'username'
          },
          {
            title: '手机号',
            key: 'phone_number'
          },
          {
            title: '邮箱',
            key: 'email'
          },
          {
            title: '状态',
            key: 'status',
            render: (h, params) => {
              return h('span', params.row.status == '1' ? '正常' : '禁用');
            }
          },
          {
            title: '角色',
            // key: 'role',
            render: (h, params) => {
              return h('span', params.row.roles[0])
            }
          },
          {
            title: '创建时间',
            key: 'create_time'
          },
          {
            title: '操作',
            render: (h, params) => {
              return h('div', {
                style: {
                  paddingBottom: '5px'
                }
              }, [
                this.g_perm('edit') ? h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginTop: '5px',
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.showEditModal(params.row, 1);
                    }
                  }
                }, '编辑') : '',
                this.g_perm('delete') ? h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  style: {
                    marginTop: '5px',
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.deleteTip(params.row);
                    }
                  }
                }, '删除') : '',
                this.g_perm('updatepw') ? h('Button', {
                  props: {
                    type: 'success',
                    size: 'small'
                  },
                  style: {
                    marginTop: '5px',
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.editModal(params.row);
                    }
                  }
                }, '修改密码') : ''
              ]);
            }
          }
        ],
        tableData: [],
        rolesList: [], // 角色列表
        falg: false,
        MTitle: '',
        formValidate: {
          username: '',  // 用户名
          phone_number: '',
          email: '',
          password: '', // 密码
          confirmPassword: '', // 确认密码
          status: true,
          roleName: '', // 用户角色
          roleId: '',
        },
        ruleValidate: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' }
          ],
          phone_number: [
            { required: true, message: '请输入手机号', trigger: 'blur' }
          ],
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' }
          ],
          confirmPassword: [
            { required: true, message: '请再次输入密码', trigger: 'blur' },
            { validator: validatorPwd, trigger: 'blur' }
          ],
          roleName: [
            { required: true, message: '请选择用户角色', trigger: 'change' }
          ]
        },
        modalStatusPwd: false, // 修改密码弹窗
        formItemPwd: {
          id: '',
          password: '',
          newPassword: ''
        },
        ruleValidatePwd: {
          password: [
            {required: true, message: '请输入原始密码', trigger: 'blur'}
          ],
          newPassword: [
            {required: true, message: '请输入新密码', trigger: 'blur'}
          ]
        },
        // 分页数据
        totalCount: 0, // 数据总数
        pageSizeOpts: [10, 20, 50, 100], //选择每页数量
        pageSize: 20, // 每页显示数量
        pageIndex: 1, // 页码
      }
    },
    methods: {
      // 分页方法
      // 切换每页显示条数
      changePageSize(size) {
        this.pageSize = size
        if (this.pageIndex === 1) {
          this.getUsers()
        }
      },
      // 页数改变时
      changePage(page) {
        this.pageIndex = page
        this.getUsers()
      },
      async getUsers () {
        let params = {
          username: this.username,
          status: this.from,
          pegeIndex: this.pageIndex,
          pageSize: this.pageSize
        }
        api.getUsers(params).then((res) => {
          if (res.data.code == 200) {
            this.tableData = res.data.data.result;
            this.totalCount = res.data.data.totalCount
          }
        });
      },
      async getRoles () {
        api.getRoles().then((res) => {
          if (res.data.code == 200) {
            this.rolesList = res.data.data.result
          }
        })
      },
      async showEditModal (currRow, type) {
        this.falg = true
        this.MTitle = type
        if (type == 1) {
          this.formValidate.username = currRow.username,
          this.formValidate.phone_number = currRow.phone_number,
          this.formValidate.email = currRow.email,
          this.formValidate.status = currRow.status == 0 ? false : true,
          this.formValidate.roleName = currRow.roles
          this.formValidate.id = currRow.id
          for (let i in this.rolesList) {
            if(this.rolesList[i].rolename == currRow.roles) {
              this.formValidate.roleId = this.rolesList[i].id
            }
          }
        }
      },
      ok (name) {
        this.$refs['formValidate'].validate((valid) => {
          if (valid) {
            if(this.MTitle == 0) {
              let params = {
                username: this.formValidate.username,
                email: this.formValidate.email,
                phone_number: this.formValidate.phone_number,
                password: this.formValidate.password,
                confirm_password: this.formValidate.confirmPassword,
                status: this.formValidate.status ? 1 : 0,
                roles: this.formValidate.roleId
              }
              api.addUsers(params).then((res) => {
                // if (res)
                if (res.data.code == 200) {
                  this.$Message.success('成功')
                  this.cancel()
                  this.getUsers()
                } 
              })
            } else {
              let params = {
                user_id: this.formValidate.id,
                username: this.formValidate.username,
                phone_number: this.formValidate.phone_number,
                email: this.formValidate.email,
                status: this.formValidate.status ? 1 : 0,
                roles: this.formValidate.roleId
                // 参数：用户名：username 电话号码：phone_number 邮箱：email 状态：status  int 类型 1正常 0 禁用  角色：roles  int 类型 
              }
              api.editUsers(params).then((res) => {
                // console.log(res)
                if (res.data.code == 200) {
                  this.$Message.success('成功')
                  this.cancel()
                  this.getUsers()
                }
              })
            }
          }
        })
        // this.cancel(name)
      },
      cancel () {
        this.$refs['formValidate'].resetFields();
        this.falg = false
      },
      select (value) {
        for (let i in this.rolesList) {
          if(this.rolesList[i].rolename == value.roleName) {
            this.formValidate.roleId = this.rolesList[i].id
          }
        }
        // this.formValidate.roleId = value.id
      },
      deleteTip (item) {
        this.$Modal.confirm({
          title: '提示',
          content: '确认删除 ' + item.username + ' ？',
          onOk: () => {
            this.deleteRequest(item);
          }
        });
      },
      deleteRequest (item) {
        let params = {
          user_id: item.id
        }
        api.deleteUsers(params).then((res) => {
          if (res.data.code == 200) {
            this.$Message.success('删除成功');
            // 提交成功重新获取
            this.getUsers();
          }
        })
      },
      editModal (item) {
        this.modalStatusPwd = true
        this.formItemPwd.id = item.id
        // console.log(item)
      },
      handleSubmitPwd () {
        this.$refs['formItemPwd'].validate((valid) => {
          if (valid) {
            // let params = this.formItemPwd
            let params = {
              id: this.formItemPwd.id,
              old_password: this.formItemPwd.password,
              password: this.formItemPwd.newPassword
              // newPassword
              
            }
            api.updatePwd(params).then((res) => {
              if (res.data.code == 200) {
                this.$Message.success('成功')
                this.handleResetPwd()
                this.getUsers()
              }
            })
          }
        })
      },
      handleResetPwd () {
        this.$refs['formItemPwd'].resetFields();
        this.modalStatusPwd = false
      }
    },
    created() {
      this.getUsers()
      this.getRoles()
    },
  }
</script>
