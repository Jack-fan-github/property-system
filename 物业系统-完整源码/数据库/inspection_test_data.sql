CREATE TABLE IF NOT EXISTS inspection_point (
  point_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  point_code VARCHAR(40) NOT NULL UNIQUE,
  point_name VARCHAR(100) NOT NULL,
  point_type VARCHAR(50) NOT NULL,
  area VARCHAR(80), floor VARCHAR(80), enabled TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS inspection_task (
  task_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_name VARCHAR(120) NOT NULL, point_id BIGINT NOT NULL,
  assignee_id BIGINT NULL, plan_date DATE NOT NULL, deadline DATETIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT '待处理', abnormal TINYINT NOT NULL DEFAULT 0,
  submitted_at DATETIME NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_inspection_task_point FOREIGN KEY (point_id) REFERENCES inspection_point(point_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS inspection_record (
  record_id BIGINT PRIMARY KEY AUTO_INCREMENT, task_id BIGINT NOT NULL,
  result VARCHAR(20) NOT NULL, abnormal_count INT NOT NULL DEFAULT 0,
  submitted_at DATETIME NULL, remark VARCHAR(500),
  CONSTRAINT fk_inspection_record_task FOREIGN KEY (task_id) REFERENCES inspection_task(task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO inspection_point(point_code,point_name,point_type,area,floor,enabled) VALUES
 ('P-2026-001','1#配电柜','配电房','教学区','B-1F',1),('P-2026-002','消防栓-3栋','消防','宿舍区','3栋1F',1),('P-2026-003','生活水泵','水泵房','后勤区','-1F',1),('P-2026-004','空调机组','空调/新风','教学区','5F',0)
 ON DUPLICATE KEY UPDATE point_name=VALUES(point_name),enabled=VALUES(enabled);
INSERT INTO inspection_task(task_name,point_id,assignee_id,plan_date,deadline,status,abnormal,submitted_at)
SELECT '配电房日间巡检',point_id,19,CURDATE(),CONCAT(CURDATE(),' 10:00:00'),'已完成',0,NOW() FROM inspection_point WHERE point_code='P-2026-001'
 AND NOT EXISTS(SELECT 1 FROM inspection_task WHERE task_name='配电房日间巡检' AND plan_date=CURDATE());
INSERT INTO inspection_task(task_name,point_id,assignee_id,plan_date,deadline,status,abnormal)
SELECT '消防栓巡检',point_id,19,CURDATE(),CONCAT(CURDATE(),' 14:00:00'),'执行中',1 FROM inspection_point WHERE point_code='P-2026-002'
 AND NOT EXISTS(SELECT 1 FROM inspection_task WHERE task_name='消防栓巡检' AND plan_date=CURDATE());
INSERT INTO inspection_task(task_name,point_id,assignee_id,plan_date,deadline,status,abnormal)
SELECT '泵房设备检查',point_id,NULL,CURDATE(),CONCAT(CURDATE(),' 16:00:00'),'漏检',0 FROM inspection_point WHERE point_code='P-2026-003'
 AND NOT EXISTS(SELECT 1 FROM inspection_task WHERE task_name='泵房设备检查' AND plan_date=CURDATE());
