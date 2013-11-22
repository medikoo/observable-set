'use strict';

module.exports = function (set, added, deleted) {
	var event;
	if (added && added.length) {
		if (deleted && deleted.length) {
			event = { type: 'batch', added: added, deleted: deleted };
		} else if (added.length === 1) {
			event = { type: 'add', value: added[0] };
		} else {
			event = { type: 'batch', added: added };
		}
	} else if (deleted && deleted.length) {
		if (deleted.length === 1) {
			event = { type: 'delete', value: deleted[0] };
		} else {
			event = { type: 'batch', deleted: deleted };
		}
	}
	if (!event) return;
	set.emit('change', event);
};
