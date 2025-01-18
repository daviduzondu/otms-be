CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply unique names for each table's trigger
CREATE TRIGGER update_tests_updated_at_tests
BEFORE UPDATE ON "tests"
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_tests_updated_at_classes
BEFORE UPDATE ON "classes"
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();


CREATE TRIGGER update_tests_updated_at_media
BEFORE UPDATE ON "media"
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_tests_updated_at_questions
BEFORE UPDATE ON "questions"
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_tests_updated_at_student_class
BEFORE UPDATE ON "student_class"
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_tests_updated_at_student_grading
BEFORE UPDATE ON "student_grading"
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_tests_updated_at_student_tokens
BEFORE UPDATE ON "student_tokens"
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_tests_updated_at_students
BEFORE UPDATE ON "students"
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_tests_updated_at_teachers
BEFORE UPDATE ON "teachers"
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_tests_updated_at_test_attempts
BEFORE UPDATE ON "test_attempts"
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_tests_updated_at_test_participants
BEFORE UPDATE ON "test_participants"
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();