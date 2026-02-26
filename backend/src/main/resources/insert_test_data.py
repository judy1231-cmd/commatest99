import pymysql
import bcrypt

conn = pymysql.connect(
    host='localhost',
    user='root',
    password='admin1234',
    database='comma_db',
    charset='utf8mb4'
)

pw_user  = bcrypt.hashpw(b'test1234',  bcrypt.gensalt()).decode()
pw_admin = bcrypt.hashpw(b'admin1234', bcrypt.gensalt()).decode()

users = [
    ('쉼표1001', 'user1@comma.com',  pw_user,  '테스터1',  'active', 1, 'USER'),
    ('쉼표1002', 'user2@comma.com',  pw_user,  '테스터2',  'active', 1, 'USER'),
    ('쉼표1003', 'user3@comma.com',  pw_user,  '테스터3',  'active', 1, 'USER'),
    ('쉼표9001', 'admin1@comma.com', pw_admin, '슈퍼관리자', 'active', 1, 'ADMIN'),
    ('쉼표9002', 'admin2@comma.com', pw_admin, '관리자2',   'active', 1, 'ADMIN'),
    ('쉼표9003', 'admin3@comma.com', pw_admin, '관리자3',   'active', 1, 'ADMIN'),
]

admins = [
    ('쉼표9001', 9),
    ('쉼표9002', 1),
    ('쉼표9003', 1),
]

with conn.cursor() as cur:
    col = '쉼표번호'
    for u in users:
        cur.execute(
            f"INSERT IGNORE INTO users (`{col}`, email, password, nickname, status, email_verified, role) VALUES (%s,%s,%s,%s,%s,%s,%s)",
            u
        )
    for a in admins:
        cur.execute(
            f"INSERT IGNORE INTO admin_users (`{col}`, permission_level) VALUES (%s,%s)",
            a
        )
    conn.commit()
    cur.execute(f"SELECT email, nickname, role FROM users")
    rows = cur.fetchall()
    for r in rows:
        print(r)

conn.close()
print("완료!")
