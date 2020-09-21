<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisibleRoles=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区  -->
      <el-table :data="rolelist" style="width: 100%" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom',i1==0?'bdtop':'','vcenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级三级权限 -->
              <el-col :span="19">
                <!-- 渲染二级权限  -->
                <el-row
                  :class="[i2==0?'':'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3,i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" min-width="300px"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述" min-width="300px"></el-table-column>
        <el-table-column label="操作" min-width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeUserById(scope.row.id)"
            >删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加角色 -->
      <el-dialog title="添加用户" :visible.sync="addDialogVisibleRoles" width="50%">
        <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addFormRef">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button @click="addDialogVisibleRoles = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </div>
      </el-dialog>

      <!-- 修改角色对话框 -->
      <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%">
        <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editFormRef">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRolesInfo">确 定</el-button>
        </div>
      </el-dialog>

    </el-card>
      <!-- 分配权限对话框 -->
      <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%" @close="setRightDialogColsed">
        <!-- 树形控件 -->
        <el-tree
          :data="rightslist" ref='treeRef'
          :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys">
        </el-tree>
        <div slot="footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </div>
      </el-dialog>
  </div>
</template>

<script>
 
export default {
  data() {
    return {
      // 所有角色列表数据
      rolelist: [],
      //   对话框是否显示
      addDialogVisibleRoles: false,
      // 修改用户对话框是否显示
      editDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        roleName: "",
        roleDesc: ""
      },
      addFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 2, message: "角色名称长度最小为3", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          { min: 2, message: "角色描述长度最小为3", trigger: "blur" }
        ]
      },
      //   查询到的用户信息对象
      editForm: {},

      editFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 2, message: "角色名称长度最小为3", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          { min: 2, message: "角色描述长度最小为3", trigger: "blur" }
        ]
      },
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible:false,
      // 所有权限的数据
      rightslist:[],
      // 树形控件的属性绑定事件
      treeProps:{
        label:'authName',
        children:'children'
      },
      // 默认选中的节点id值
      defKeys:[],
      // 当前即将分配权限的角色id
      roleId:''
    };
  },
  created() {
    this.getRolesList();
  },

  methods: {
    // 获取所有角色列表数据
    async getRolesList() {
      const { data: res } =
       await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取列表失败");
      }
      this.rolelist = res.data;
      //   console.log(this.rolelist);
    },
    // 点击按钮   添加新用户
    addUser() {
      this.$refs["addFormRef"].validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post("roles", this.addForm);
        if (res.meta.status !== 201) {
          return this.$message.error("添加用户失败");
        }
        this.$message.success("添加用户成功");
        // 隐藏添加用户的对话框
        this.addDialogVisibleRoles = false;
        // 重新获取用户的列表数据
        this.getRolesList();
      });
    },
    // 根据id删除
    async removeUserById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(error => error);
      // 如果用户确认删除  则返回值为字符串 confirm
      // 如果用户取消删除  则返回值为字符串 cancel
      // console.log(confirmResult)
      if (confirmResult != "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败");
      }
      this.$message.success("删除成功");
      // 重新获取用户的列表数据
      this.getRolesList();
    },
    // 展开用户编辑对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get("roles/" + id);
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("查询用户失败");
      }
      this.editForm = res.data;

      // this.$message.success("请求成功")
      this.editDialogVisible = true;
    },
    editRolesInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "roles/" + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        );
        // console.log(this.editForm);
        if (res.meta.status !== 200) {
          return this.$message.error("修改数据失败");
        }
        // 关闭对话框
        this.editDialogVisible = false;
        // 刷新数据列表
        this.getRolesList();
        this.$message.success("修改数据成功");
      });
    },
    // 根据id删除对应的权限
    async removeRightById(role, rightId) {
      // 提示用户是否要删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败");
      }
      // this.$message.success('删除成功')
      // this.getRolesList()
      role.children = res.data;
      // console.log(role);
      
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role){
      this.roleId = role.id
      // 获取所有权限的数据
      const {data:res} = await this.$http.get('rights/tree')
      if(res.meta.status!==200){
        this.$message.error('获取权限数据失败')
      }
      // 把获取到的权限数据放到data中
      this.rightslist = res.data
      // console.log(this.rightslist);
      // 递归获取三级节点的id
      this.getLeafKeys(role,this.defKeys)
      // console.log(this.defKeys)
      this.setRightDialogVisible=true
    },
    // 通过递归的形式 获取角色下所有三级权限的id 并保存到数组中
    getLeafKeys(node,arr){
      // 如果当前node节点不包括children属性，则是三级节点
      if(!node.children){
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item,arr)
      });

    },
    // 监听分配权限对话框的关闭事件
    setRightDialogColsed(){
      this.defKeys =[]
    },
    // 带点击为角色分配权限
    async allotRights(){
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
      if(res.meta.status!==200){
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
</style>