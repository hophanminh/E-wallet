import 'package:flutter/material.dart';
import 'package:flutter_slidable/flutter_slidable.dart';
import 'package:mobile/src/models/EventsProvider.dart';
import 'package:mobile/src/services/socketservices/socket.dart';
import 'package:mobile/src/views/ui/wallet/event/add_event.dart';
import 'package:mobile/src/views/ui/wallet/event/delete_event.dart';
import 'package:mobile/src/views/ui/wallet/event/view_event.dart';
import 'package:mobile/src/views/utils/helpers/helper.dart';
import 'package:mobile/src/views/utils/widgets/widget.dart';
import 'package:provider/provider.dart';
import 'package:socket_io_client/socket_io_client.dart';

class EventDashboard extends StatefulWidget {
  final String walletID;

  const EventDashboard({Key key, @required this.walletID}) : super(key: key);

  @override
  _EventDashboardState createState() => _EventDashboardState();
}

class _EventDashboardState extends State<EventDashboard> {
  var _scaffoldKey = GlobalKey<ScaffoldMessengerState>();
  var _searchController = new TextEditingController();
  Socket _socket;

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    initPage();
  }

  initPage() async {
    EventsProvider eventsProvider = Provider.of<EventsProvider>(context, listen: false);

    _searchController.addListener(_onHandleChangeSearchBar);

    _socket = await getSocket();

    _socket.emitWithAck('get_event_type', {}, ack: (data) {
      eventsProvider.fetchType(data);
      eventsProvider.changeSearchString('');
    });
  }

  void _onHandleChangeSearchBar() {
    Provider.of<EventsProvider>(context, listen: false).changeSearchString(_searchController.text.trim());
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
          appBar: mySimpleAppBar('Quản lý sự kiện', shadow: Colors.transparent),
          body: SingleChildScrollView(
            child: Column(
              children: [
                Container(
                  padding: EdgeInsets.symmetric(vertical: 15),
                  decoration: BoxDecoration(color: primary),
                  child: mySearchBar(context, _searchController, 'Tìm kiếm tên sự kiện', radius: 30),
                ),
                Container(
                  padding: EdgeInsets.fromLTRB(13, 30, 13, 50),
                  width: MediaQuery.of(context).size.width,
                  child: Consumer<EventsProvider>(builder: (context, eventsProvider, child) {
                    return Column(
                      children: [
                        Align(alignment: Alignment.centerLeft, child: Text('Sự kiện đang diễn ra', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 25))),
                        eventsProvider.eventList.where((element) => element.status == true).length == 0
                            ? Container(
                                padding: EdgeInsets.all(20),
                                child: Text('Chưa có sự kiện đang chạy'),
                              )
                            : eventsProvider.getFilteredList().where((element) => element.status == true).length == 0
                                ? Container(
                                    padding: EdgeInsets.all(20),
                                    child: Text('Không có kết quả phù hợp'),
                                  )
                                : Column(
                                    children: [for (Events item in eventsProvider.getFilteredList().where((element) => element.status == true)) _createRunningEventList(item)],
                                  ),
                        Padding(
                          padding: const EdgeInsets.only(top: 20.0),
                          child: Align(alignment: Alignment.centerLeft, child: Text('Sự kiện đã ngưng', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 25))),
                        ),
                        eventsProvider.eventList.where((element) => element.status == false).length == 0
                            ? Container(
                                padding: EdgeInsets.all(20),
                                child: Text('Chưa có sự kiện đã ngưng'),
                              )
                            : eventsProvider.getFilteredList().where((element) => element.status == false).length == 0
                                ? Container(
                                    padding: EdgeInsets.all(20),
                                    child: Text('Không có kết quả phù hợp'),
                                  )
                                : Column(
                                    children: [
                                      for (Events item in eventsProvider.getFilteredList().where((element) => element.status == false)) _createStoppedEventList(item),
                                    ],
                                  ),
                      ],
                    );
                  }),
                ),
              ],
            ),
          ),
          floatingActionButton: _catDashboardActionButton(),
        ));
  }

  _createRunningEventList(Events item) {
    return Card(
      color: Colors.transparent,
      shadowColor: Colors.transparent,
      margin: EdgeInsets.symmetric(vertical: 10),
      child: GestureDetector(
        onTap: () {
          Provider.of<EventsProvider>(context, listen: false).changeSelected(item);
          Navigator.push(context, MaterialPageRoute(builder: (context) => ViewEvent()));
        },
        child: Slidable(
          actionPane: SlidableDrawerActionPane(),
          actionExtentRatio: 0.25,
          secondaryActions: <Widget>[
            IconSlideAction(
              caption: 'Kết thúc',
              color: warning,
              icon: Icons.stop,
              onTap: () async {
                await showDialog(
                    context: context,
                    builder: (_) => DeleteEventDialog(
                          wrappingScaffoldKey: _scaffoldKey,
                          walletID: widget.walletID,
                          eventID: item.id,
                        ));
              },
            ),
          ],
          child: DefaultTextStyle(
            style: TextStyle(fontSize: 15, color: Colors.white),
            child: Container(
              decoration: BoxDecoration(gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight,
                  // colors: [primary.withOpacity(0.9), const Color(0xffb3eb50)]
                  colors: [Color(0xff3977fe), Color(0xff80b8f1)]), borderRadius: BorderRadius.circular(12), boxShadow: [
                BoxShadow(
                  color: Color(0xffd0e6ff),
                  spreadRadius: 3,
                  blurRadius: 5,
                  offset: Offset(0, 2), // changes position of shadow
                ),
              ]),
              padding: EdgeInsets.all(15),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Container(
                    padding: const EdgeInsets.only(top: 10),
                    child: Text(
                      item.name,
                      style: TextStyle(fontSize: 20),
                    )),
                Padding(
                    padding: const EdgeInsets.only(top: 15),
                    child: Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          '${item.expectingAmount < 0 ? '' : '+'}${formatMoneyWithSymbol(item.expectingAmount)}',
                          style: TextStyle(color: item.expectingAmount < 0 ? Colors.redAccent[100] : Colors.lightGreenAccent[100], fontWeight: FontWeight.bold, fontSize: 35),
                        ))),
                Padding(
                  padding: const EdgeInsets.only(top: 15.0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                          child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Giao dịch kế tiếp'),
                          Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: Text('${convertToDDMMYYYYHHMM(item.nextDate)}', style: TextStyle(fontWeight: FontWeight.w300)),
                          )
                        ],
                      )),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text('Thời gian còn lại'),
                            Padding(
                              padding: const EdgeInsets.only(top: 8.0),
                              child: Text('${timeRemaining(item.nextDate)}', textAlign: TextAlign.end, style: TextStyle(fontWeight: FontWeight.w300)),
                            )
                          ],
                        ),
                      )
                    ],
                  ),
                ),
              ]),
            ),
          ),
        ),
      ),
    );
  }

  _createStoppedEventList(Events item) {
    return Card(
      color: Colors.transparent,
      shadowColor: Colors.transparent,
      margin: EdgeInsets.symmetric(vertical: 10),
      child: GestureDetector(
        onTap: () {
          Provider.of<EventsProvider>(context, listen: false).changeSelected(item);
          Navigator.push(context, MaterialPageRoute(builder: (context) => ViewEvent()));
        },
        child: DefaultTextStyle(
          style: TextStyle(fontSize: 15, color: Colors.white),
          child: Container(
            decoration: BoxDecoration(
                gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Colors.grey[700], Colors.grey]),
                // color: Color(0xff13315f),
                // border: Border.all(color: primary, width: 2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.5),
                    spreadRadius: 3,
                    blurRadius: 5,
                    offset: Offset(1, 2), // changes position of shadow
                  )
                ],
                borderRadius: BorderRadius.circular(7)),
            padding: EdgeInsets.all(15),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Container(
                  padding: const EdgeInsets.only(top: 10),
                  child: Text(
                    item.name,
                    style: TextStyle(fontSize: 20),
                  )),
              Padding(
                  padding: const EdgeInsets.only(top: 15),
                  child: Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        '${item.expectingAmount < 0 ? '' : '+'}${formatMoneyWithSymbol(item.expectingAmount)}',
                        style: TextStyle(color: item.expectingAmount < 0 ? Colors.redAccent[100] : Colors.lightGreenAccent[100], fontWeight: FontWeight.bold, fontSize: 35),
                      ))),
              Padding(
                padding: const EdgeInsets.only(top: 15.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Ngày bắt đầu'),
                          Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: Text('${convertToDDMMYYYYHHMM(item.startDate)}', style: TextStyle(fontWeight: FontWeight.w300)),
                          )
                        ],
                      ),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text('Ngày kết thúc'),
                          Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: Text('${convertToDDMMYYYYHHMM(item.endDate)}', textAlign: TextAlign.end, style: TextStyle(fontWeight: FontWeight.w300)),
                          )
                        ],
                      ),
                    )
                  ],
                ),
              ),
            ]),
          ),
        ),
      ),
    );
  }

  FloatingActionButton _catDashboardActionButton() => FloatingActionButton(
      onPressed: () async {
        await Navigator.push(context, MaterialPageRoute(builder: (context) => AddEvent(walletID: widget.walletID, wrappingScaffoldKey: _scaffoldKey)));
      },
      tooltip: 'Thêm sự kiện mới',
      child: Icon(Icons.add),
      backgroundColor: secondary,
      foregroundColor: Colors.white);
}
