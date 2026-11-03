import Saver from "./Saver.js";

export default class MemorySaver extends Saver {

	load(){ return Promise.resolve(this.json); }

	write(item){
		this.json = JSON.parse(JSON.stringify(item));
		this.save_count++;
		return Promise.resolve(true);
	}

	delete(){
		this.json = null;
		this.deleted = true;
		return Promise.resolve(true);
	}
}

// ⚠ Prototype, not class fields: the constructor assigns in `super()`, so a
// field would overwrite whatever the caller passed.
MemorySaver.prototype.json = null;
MemorySaver.prototype.save_count = 0;
MemorySaver.prototype.deleted = false;
