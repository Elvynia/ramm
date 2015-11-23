package org.arcanic.ramm.repository;

import java.util.List;

import org.arcanic.ramm.document.Note;
import org.arcanic.ramm.document.NoteRef;
import org.arcanic.ramm.document.Reference;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface NoteRefRepository extends MongoRepository<NoteRef, String> {

	@Query("{'note.id' : {$in: ?1}}")
	Integer countByReferenceId(final Reference reference, final List<String> noteIds);

	List<NoteRef> findByNote(final Note note);

	@Query("{'reference.id' : {$ne: ?1}}")
	List<NoteRef> findByNote(final Note note, final String referenceId);

	List<NoteRef> findByReference(final Reference reference);
}
