import { MigrationInterface, QueryRunner } from 'typeorm';

export class notification1655743104456 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create or replace function remove_notification_verifiedAt()
        returns trigger
        language plpgsql
       as $$
           declare
           begin
             IF NEW."verifiedAt" IS NULL OR OLD."verifiedAt" IS NULL THEN
               RETURN NULL;
             end if;
                 UPDATE inbox_notification
                 SET "verifiedAt" = NULL
                 WHERE id = NEW.id AND "verifiedAt" IS NOT NULL;  
             RETURN NULL;
           end;
       $$;
       
       CREATE or replace TRIGGER update_notifications
                AFTER UPDATE
                   ON inbox_notification
             FOR EACH ROW
              EXECUTE PROCEDURE remove_notification_verifiedAt();`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER update_notifications ON inbox_notification;`
    );
    await queryRunner.query(`DROP FUNCTION remove_notification_verifiedAt();`);
  }
}
