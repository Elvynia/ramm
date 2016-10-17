import {Component, Input, Output, EventEmitter, ViewChild, OnInit} from '@angular/core';

import {TgInstanceComponent} from 'trilliangular/runtime/three/tg-instance.component';
import {TgState} from 'trilliangular/core/tg-state.class';
import {MOUSE} from 'trilliangular/inputs/tg-mouse.enum';
import {TgMouselistener} from 'trilliangular/inputs/tg-mouselistener.class';
import {TgMouselistenerService} from 'trilliangular/inputs/tg-mouselistener.service';

import {RammService} from '../ramm/ramm.service';
import {Tag} from '../tag/tag.class';

@Component({
	selector: 'tag-layout',
	templateUrl: '../views/tag-layout.template.html',
	styleUrls: ['../css/tag-layout.css']
})
export class TagLayoutComponent implements OnInit {
	@Input() tags: Array<Tag>;
	@Output() tagSelected: EventEmitter<[Tag, boolean]>;
	@ViewChild('plane') plane: TgInstanceComponent;
	private editing: Tag;
	private hovering: Tag;
	private selectedTags: Array<Tag>;

	constructor(private mouseService: TgMouselistenerService, private rammService: RammService) {
		this.tagSelected = new EventEmitter<[Tag, boolean]>();
		this.editing = null;
		this.hovering = null;
		this.selectedTags = new Array<Tag>();
	}

	ngOnInit() {
		this.mouseService.initialize(document.getElementsByTagName("canvas")[0]);
		this.mouseService.events
			.filter((event:TgMouselistener) => event.type === MOUSE.CLICKED || event.type === MOUSE.DOUBLE_CLICKED)
			.debounceTime(200)
			.subscribe((event:TgMouselistener) => {
				if (event.type === MOUSE.CLICKED
					&& event.nativeEvent.button == 0) {
					this.selectTag(event);
				} else {
					// TODO: Enter the tag !
				}
			});
		this.mouseService
			.eventsByType(MOUSE.MOVED)
			.subscribe((event:TgMouselistener) => {
				this.hovering = this.projectOnTag(event.nativeEvent.clientX, event.nativeEvent.clientY);
			});
		this.mouseService
			.eventsByType(MOUSE.CONTEXT_MENU)
			.subscribe((event:TgMouselistener) => {
				this.editTag(event);
				event.nativeEvent.preventDefault();
			});
	}

	private saveTag() {
		if (this.editing._id) {
			this.rammService.editTag(this.editing);
		} else {
			this.rammService.addTag(this.editing);
		}
		this.editing = null;
	}

	private deleteTag() {
		if (this.editing._id) {
			let index = this.selectedTags.indexOf(this.editing);
			if (index >= 0) {
				this.selectedTags.splice(index, 1);
			}
			this.rammService.deleteTag(this.editing);
		}
		this.editing = null;
	}

	private startTagPlane(state: TgState) {
		this.plane.instance.rotation.x = -Math.PI / 2;
	}

	private editTag(listener: TgMouselistener) {
		let x = listener.nativeEvent.clientX;
		let y = listener.nativeEvent.clientY;
		let editTag: Tag = this.projectOnTag(x, y);
		if (editTag) {
			// Modify an existing tag.
			this.editing = editTag;
		} else {
			// Check if clicked on the tag plane.
			let x = listener.nativeEvent.clientX;
			let y = listener.nativeEvent.clientY;
			let planeIntersects = this.mouseService.mouseSelectObject(x, y, this.plane.instance);
			if (planeIntersects.length > 0) {
				// Create a new tag.
				this.editing = new Tag("");
			}
		}
	}

	private selectTag(listener: TgMouselistener) {
		let x = listener.nativeEvent.clientX;
		let y = listener.nativeEvent.clientY;
		let tag: Tag = this.projectOnTag(x, y);
		if (tag) {
			let index = this.selectedTags.indexOf(tag);
			if (index < 0) {
				// Add to selection.
				this.selectedTags.push(tag);
				this.tagSelected.next([tag, true]);
			} else {
				// Unselect.
				this.selectedTags.splice(index, 1);
				this.tagSelected.next([tag, false]);
			}
		}
	}

	private projectOnTag(x: number, y: number): Tag {
		let result = null;
		let intersections = this.mouseService.mouseSelect(x, y);
		if (intersections.length > 0/* && intersections[0].object !== this.plane.instance*/) {
			result = this.getTagById(intersections[0].object.name);
		}
		return result;
	}

	private getTagById(id: string): Tag {
		let result = null;
		for (var i = this.tags.length - 1; i >= 0; i--) {
			if (this.tags[i]._id === id) {
				result = this.tags[i];
				break;
			}
		}
		return result;
	}
}