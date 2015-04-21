package util;

import java.sql.Timestamp;

import javax.persistence.*;

import com.avaje.ebean.Ebean;

import play.db.ebean.Model.Finder;

@Entity
public class SessionId {
	@Id
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator = "session_seq_gen")
	@SequenceGenerator(name = "session_seq_gen", sequenceName = "session_id_session_id_seq")
	public Long session_id; //Sequential session ID generated by database.
	@Column(insertable = false, updatable = false)
	public Timestamp create_time;
	public String userEmail;
	
	public SessionId(String email){
		this.userEmail = email;
		Ebean.save(this);
	}
	
	/**
	 * Find method to populate a scenario object from the database by passing a scenarioID as key
	 * syntax: Scenario scenario1 = Scenario.find.byId(scenarioID)
	 * @return scenario object
	 */
	public static Finder<Long,SessionId> find = new Finder<Long,SessionId>(
			Long.class, SessionId.class
			); 
}
