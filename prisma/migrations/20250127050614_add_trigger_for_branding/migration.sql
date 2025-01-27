CREATE TRIGGER update_tests_updated_at_branding
BEFORE UPDATE ON "branding"
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();