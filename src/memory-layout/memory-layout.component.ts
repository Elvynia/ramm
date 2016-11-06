import {Component, Input, DoCheck} from '@angular/core';

import {RammService} from '../ramm/ramm.service';
import {Memory} from '../memory/memory.class';
import {Tag} from '../tag/tag.class';

@Component({
	selector: 'memory-layout',
	templateUrl: '../views/memory-layout.template.html',
	styleUrls: ['../css/memory-layout.css'],
})
export class MemoryLayoutComponent {
	@Input() memories: Array<Memory>;
	@Input() activeTags: Array<Tag>;
	@Input() filterTags: Array<Tag>;
	private editing: Memory;
	private showInputs: boolean;

	constructor(private rammService: RammService) {
		this.editing = new Memory();
		this.showInputs = false;
	}

	private addMemory() {
		console.debug('Active tags : ' + this.activeTags);
		if (this.activeTags.length === 0) {
			this.editing.tags = undefined;
		} else {
			for (var i = this.activeTags.length - 1; i >= 0; i--) {
				this.editing.tags.push(this.activeTags[i]);
			}
		}
		this.rammService.addMemory(this.editing);
		this.editing = new Memory();
	}
}