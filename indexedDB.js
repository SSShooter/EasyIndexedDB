//IDBTransacation接口由IndexedDB API提供，异步transaction使用数据库中的事件对象属性。所有的读取和写入数据均在transactions中完成。由IDBDatabase发起transaction，通过IDBTransaction 来设置transaction的模式（例如是否只读或读写），以及通过IDBObjectStore来获得一个request。同时你也可以使用它来中止transactions。

var idxDB = {
	db: {},
	transaction: {},
	startTransaction: function () {
			//一个IDBTransacation只能使用一次
			this.transaction = this.db.transaction("diary", 'readwrite');
			this.transaction.oncomplete = function () {
				console.log("transaction complete");
			};
			this.transaction.onerror = function (event) {
				console.dir(event)
			};
	},
	initDB: function () {
		var request = indexedDB.open('disannoy', 1);
		request.onerror = e => console.log(e.currentTarget.error.message);
		request.onsuccess = e => this.db = e.target.result;
		request.onupgradeneeded = e => {
			var thisDB = e.target.result;
			if (!thisDB.objectStoreNames.contains("diary")) {
				var objStore = thisDB.createObjectStore("diary", {
					keyPath: "id",
					autoIncrement: true
				});
				objStore.createIndex("create_date", "create_date", {
					unique: false
				});
				objStore.createIndex("modify_date", "modify_date", {
					unique: false
				});
			}
		};
	},
	closeDB: function () {
		db.close();
	},
	deleteDB: function () {
		indexedDB.deleteDatabase('disannoy');
		db.close();
	},
	deleteObjectStore: function (id, cb) {
		this.startTransaction();
		var objectStore = this.transaction.objectStore("diary");
		var request = objectStore.clear();
		request.onsuccess = function (e) {
			if (cb) cb({
				error: 0,
				data: id
			});
		};
		request.onerror = function (e) {
			if (cb) cb({
				error: 1
			});
		};
	},
	addData: function (data, cb) {
		this.startTransaction();
		var objectStore = this.transaction.objectStore("diary");
		var request = objectStore.add(data);
		request.onsuccess = function (e) {
			if (cb) cb({
				error: 0,
				data: data
			})
		};
		request.onerror = function (e) {
			if (cb) cb({
				error: 1
			})
		}
	},
	addmData: function (mdata, cb) {
		this.startTransaction();
		var objectStore = this.transaction.objectStore("diary");
		for (var c = 0; c < mdata.length; c++) {
			var request = objectStore.add(mdata[c]);
			request.onerror = function (e) {
				if (cb) cb({
					error: 1
				})
			}
		}
	},
	deleteData: function (id, cb) {
		this.startTransaction();
		var objectStore = this.transaction.objectStore("diary");
		var request = objectStore.delete(id);
		request.onsuccess = function (e) {
			if (cb) cb({
				error: 0,
				data: id
			})
		};
		request.onerror = function (e) {
			if (cb) cb({
				error: 1
			})
		}
	},
	getDataById: function (id, cb) {
		this.startTransaction();
		var objectStore = this.transaction.objectStore("diary");
		var request = objectStore.get(id);
		request.onsuccess = function (e) {
			if (cb) cb({
				error: 0,
				data: e.target.result
			})
		};
		request.onerror = function (e) {
			if (cb) cb({
				error: 1
			})
		}
	},
	getDataAll: function (cb) {
		this.startTransaction();
		var objectStore = this.transaction.objectStore("diary");
		var rowData = [];
		objectStore.openCursor(IDBKeyRange.lowerBound(0)).onsuccess = function (event) {
			var cursor = event.target.result;
			if (!cursor && cb) {
				cb({
					error: 0,
					data: rowData
				});
				return;
			}
			rowData.unshift(cursor.value);
			cursor.continue();
		};
	},
	updateData: function (id, updateData, cb) {
		this.startTransaction();
		var objectStore = this.transaction.objectStore("diary");
		var request = objectStore.get(id);
		request.onsuccess = function (e) {
			var thisDB = e.target.result;
			for (key in updateData) {
				thisDB[key] = updateData[key];
			}
			objectStore.put(thisDB);
			if (cb) cb({
				error: 0,
				data: thisDB
			})
		};
		request.onerror = function (e) {
			if (cb) cb({
				error: 1
			})
		}
	},
	getDataBySearch: function (keywords, cb) {
		this.startTransaction();
		var objectStore = this.transaction.objectStore("diary");
		var boundKeyRange = IDBKeyRange.only(keywords);
		var rowData = [];
		objectStore.index("folder").openCursor(boundKeyRange).onsuccess = function (event) {
			var cursor = event.target.result;
			if (!cursor) {
				if (cb) cb({
					error: 0,
					data: rowData
				})
				return;
			}
			rowData.push(cursor.value);
			cursor.continue();
		};
	},
	getDataByPager: function (start, end, cb) {
		this.startTransaction();
		var objectStore = transaction.objectStore("diary");
		var boundKeyRange = IDBKeyRange.bound(start, end, false, true);
		var rowData = [];
		objectStore.openCursor(boundKeyRange).onsuccess = function (event) {
			var cursor = event.target.result;
			if (!cursor && cb) {
				cb({
					error: 0,
					data: rowData
				});
				return;
			}
			rowData.push(cursor.value);
			cursor.continue();
		};
	}
}