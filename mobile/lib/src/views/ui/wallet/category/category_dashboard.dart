import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_slidable/flutter_slidable.dart';
import 'package:mobile/src/models/CatsProvider.dart';
import 'package:mobile/src/models/WalletsProvider.dart';
import 'package:mobile/src/services/icon_service.dart';
import 'package:mobile/src/views/ui/wallet/category/add_cat.dart';
import 'package:mobile/src/views/ui/wallet/category/delete_cate.dart';
import 'package:mobile/src/views/ui/wallet/category/edit_cat.dart';
import 'package:mobile/src/views/utils/helpers/helper.dart';
import 'package:mobile/src/views/utils/widgets/widget.dart';
import 'package:provider/provider.dart';

class CategoryDashboard extends StatefulWidget {
  final String walletID;

  const CategoryDashboard({Key key, @required this.walletID}) : super(key: key);

  @override
  _CategoryDashboardState createState() => _CategoryDashboardState();
}

class _CategoryDashboardState extends State<CategoryDashboard> {
  var _scaffoldKey = GlobalKey<ScaffoldMessengerState>();
  var _searchController = new TextEditingController();
  List<IconCustom> _iconList = [];

  String countTx(List<Transactions> txList, String id) {
    int sum = 0;
    txList.forEach((tx) {
      if (id == tx.catID) {
        sum++;
      }
    });

    if (sum > 99) {
      return '99+';
    }
    return sum.toString();
  }

  _initPage() async {
    _iconList = await IconService.instance.iconList;
    Provider.of<CatsProvider>(context, listen: false).changeSearchString('');
    _searchController.addListener(_onHandleChangeSearchBar);

    setState(() {});
  }

  void _onHandleChangeSearchBar() {
    Provider.of<CatsProvider>(context, listen: false).changeSearchString(_searchController.text.trim());
  }

  @override
  void initState() {
    _initPage();
    super.initState();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaffoldMessenger(
        key: _scaffoldKey,
        child: Scaffold(
          appBar: mySimpleAppBar('Loại giao dịch', shadow: Colors.transparent),
          body: SingleChildScrollView(
            child: Column(
              children: [
                Container(
                  padding: EdgeInsets.symmetric(vertical: 15),
                  decoration: BoxDecoration(color: primary),
                  child: mySearchBar(context, _searchController, 'Tìm kiếm tên hạng mục', radius: 30),
                ),
                Container(
                  padding: EdgeInsets.fromLTRB(10, 30, 10, 50),
                  width: MediaQuery.of(context).size.width,
                  child: Column(
                    children: [
                      Align(alignment: Alignment.centerLeft, child: Text('Loại mặc định', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 25))),
                      _createDefaultCategoryListView(),
                      Padding(
                        padding: const EdgeInsets.only(top: 20.0),
                        child: Align(alignment: Alignment.centerLeft, child: Text('Loại tự chọn', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 25))),
                      ),
                      _createCustomCategoryListView()
                    ],
                  ),
                ),
              ],
            ),
          ),
          floatingActionButton: _catDashboardActionButton(),
        ));
  }

  _createDefaultCategoryListView() {
    return Consumer<CatsProvider>(builder: (context, catsProvider, child) {
      List<Categories> filteredList = catsProvider.getDefaultFilteredList();
      return catsProvider.defaultList.length == 0
          ? Container(
              padding: EdgeInsets.all(20),
              child: Text('Chưa có loại giao dịch mặc định nào'),
            )
          : filteredList.length == 0
              ? Container(
                  padding: EdgeInsets.all(20),
                  child: Text('Không tìm thấy loại phù hợp'),
                )
              : GridView.builder(
                  physics: ScrollPhysics(),
                  padding: EdgeInsets.symmetric(vertical: 20, horizontal: 5),
                  scrollDirection: Axis.vertical,
                  shrinkWrap: true,
                  itemCount: filteredList.length,
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: MediaQuery.of(context).orientation == Orientation.landscape ? 2 : 1,
                    crossAxisSpacing: 20,
                    mainAxisSpacing: 20,
                    childAspectRatio: (30 / 8),
                  ),
                  itemBuilder: (context, index) {
                    IconCustom selectedIcon =
                        _iconList.firstWhere((element) => element.id == filteredList[index].iconID, orElse: () => new IconCustom(id: '', name: '', color: '', backgroundColor: ''));
                    return Container(
                      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 25),
                      decoration: BoxDecoration(
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.2),
                            spreadRadius: 3,
                            blurRadius: 4,
                            offset: Offset(0, 2), // changes position of shadow
                          )
                        ],
                        color: Colors.white,
                        borderRadius: BorderRadius.all(Radius.circular(10)),
                      ),
                      child: Row(
                        children: [
                          Padding(
                            padding: const EdgeInsets.only(left: 10, right: 20.0),
                            child: Container(
                                width: 40,
                                height: 40,
                                child: myCircleIcon(
                                  selectedIcon.name,
                                  selectedIcon.backgroundColor,
                                  selectedIcon.color,
                                  size: 24,
                                )),
                          ),
                          Expanded(
                              child: Text(
                            filteredList[index].name,
                            style: TextStyle(fontSize: 18),
                          )),
                          Consumer<WalletsProvider>(builder: (context, walletsProvider, child) {
                            return Chip(
                                padding: EdgeInsets.all(0),
                                backgroundColor: warning,
                                label: Container(
                                  alignment: Alignment.center,
                                  width: 50,
                                  height: 25,
                                  child: Text(countTx(walletsProvider.txList, filteredList[index].id), style: TextStyle(color: Colors.white)),
                                ));
                          }),
                        ],
                      ),
                    );
                  },
                );
    });
  }

  _createCustomCategoryListView() {
    return Consumer<CatsProvider>(builder: (context, catsProvider, child) {
      List<Categories> filteredList = catsProvider.getCustomFilteredList();

      return catsProvider.customList.length == 0
          ? Container(
              padding: EdgeInsets.all(20),
              child: Text('Chưa có loại giao dịch của riêng bạn'),
            )
          : filteredList.length == 0
              ? Container(
                  padding: EdgeInsets.all(20),
                  child: Text('Không tìm thấy loại phù hợp'),
                )
              : GridView.builder(
                  physics: ScrollPhysics(),
                  padding: EdgeInsets.symmetric(vertical: 20, horizontal: 5),
                  scrollDirection: Axis.vertical,
                  shrinkWrap: true,
                  itemCount: filteredList.length,
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: MediaQuery.of(context).orientation == Orientation.landscape ? 2 : 1,
                    crossAxisSpacing: 20,
                    mainAxisSpacing: 20,
                    childAspectRatio: (30 / 8),
                  ),
                  itemBuilder: (context, index) {
                    IconCustom selectedIcon =
                        _iconList.firstWhere((element) => element.id == filteredList[index].iconID, orElse: () => new IconCustom(id: '', name: '', color: '', backgroundColor: ''));

                    return Slidable(
                      actionPane: SlidableDrawerActionPane(),
                      actionExtentRatio: 0.25,
                      secondaryActions: <Widget>[
                        IconSlideAction(
                          caption: 'Sửa',
                          color: Colors.blue,
                          icon: Icons.edit,
                          onTap: () {
                            Provider.of<CatsProvider>(context, listen: false).changeSelected(filteredList[index]);
                            showDialog(
                                context: context,
                                builder: (_) => EditCatDialog(
                                      wrappingScaffoldKey: _scaffoldKey,
                                      walletID: widget.walletID,
                                      cat: filteredList[index],
                                    ));
                          },
                        ),
                        IconSlideAction(
                          caption: 'Xóa',
                          color: warning,
                          icon: Icons.delete_outline,
                          onTap: () {
                            showDialog(
                                context: context,
                                builder: (_) => DeleteCateDialog(
                                      wrappingScaffoldKey: _scaffoldKey,
                                      walletID: widget.walletID,
                                      cateID: filteredList[index].id,
                                    ));
                          },
                        ),
                      ],
                      child: Container(
                        padding: EdgeInsets.symmetric(horizontal: 10, vertical: 25),
                        decoration: BoxDecoration(
                          boxShadow: [
                            BoxShadow(
                              color: Colors.grey.withOpacity(0.2),
                              spreadRadius: 3,
                              blurRadius: 4,
                              offset: Offset(0, 2), // changes position of shadow
                            ),
                          ],
                          color: Colors.white,
                          borderRadius: BorderRadius.all(Radius.circular(10)),
                        ),
                        child: Row(
                          children: [
                            Padding(
                              padding: const EdgeInsets.only(left: 10, right: 20.0),
                              child: Container(
                                  width: 40,
                                  height: 40,
                                  child: myCircleIcon(
                                    selectedIcon.name,
                                    selectedIcon.backgroundColor,
                                    selectedIcon.color,
                                    size: 24,
                                  )),
                            ),
                            Expanded(
                                child: Text(
                              filteredList[index].name,
                              style: TextStyle(fontSize: 18),
                            )),
                            Consumer<WalletsProvider>(builder: (context, walletsProvider, child) {
                              return Chip(
                                  padding: EdgeInsets.all(0),
                                  backgroundColor: warning,
                                  label: Container(
                                    alignment: Alignment.center,
                                    width: 50,
                                    height: 25,
                                    child: Text(countTx(walletsProvider.txList, filteredList[index].id), style: TextStyle(color: Colors.white)),
                                  ));
                            }),
                          ],
                        ),
                      ),
                    );
                  },
                );
    });
  }

  FloatingActionButton _catDashboardActionButton() => FloatingActionButton(
      onPressed: () {
        showDialog(
            context: context,
            builder: (_) => AddCatDialog(
                  wrappingScaffoldKey: _scaffoldKey,
                  walletID: widget.walletID,
                ));
      },
      tooltip: 'Thêm loại giao dịch mới',
      child: Icon(Icons.add),
      backgroundColor: secondary,
      foregroundColor: Colors.white);
}
