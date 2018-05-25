CREATE TABLE `meters` (
  `id` int(11) NOT NULL auto_increment,
  `name` char(64) DEFAULT NULL,
  `address` char(16) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
CREATE TABLE `users` (
  `id` int(11) NOT NULL auto_increment,
  `name` char(255) DEFAULT NULL,
  `privilege` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
CREATE TABLE `meter_groups` (
  `id` int(11) NOT NULL auto_increment,
  `name` char(64) DEFAULT NULL,
  `is_building` bit(1) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `meter_groups_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
CREATE TABLE `meter_group_relation` (
  `id` int(11) NOT NULL auto_increment,
  `meter_id` int(11) DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  `operation` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `meter_id` (`meter_id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `meter_group_relation_ibfk_1` FOREIGN KEY (`meter_id`) REFERENCES `meters` (`id`),
  CONSTRAINT `meter_group_relation_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `meter_groups` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
CREATE TABLE `data` (
  `id` int(11) NOT NULL auto_increment,
  `time` datetime NOT NULL,
  `meter_id` int(11) NOT NULL,
  `accumulated_real` int(32) DEFAULT NULL,
  `real_power` float DEFAULT NULL,
  `reactive_power` float DEFAULT NULL,
  `apparent_power` float DEFAULT NULL,
  `real_a` float DEFAULT NULL,
  `real_b` float DEFAULT NULL,
  `real_c` float DEFAULT NULL,
  `reactive_a` float DEFAULT NULL,
  `reactive_b` float DEFAULT NULL,
  `reactive_c` float DEFAULT NULL,
  `apparent_a` float DEFAULT NULL,
  `apparent_b` float DEFAULT NULL,
  `apparent_c` float DEFAULT NULL,
  `pf_a` float DEFAULT NULL,
  `pf_b` float DEFAULT NULL,
  `pf_c` float DEFAULT NULL,
  `vphase_ab` float DEFAULT NULL,
  `vphase_bc` float DEFAULT NULL,
  `vphase_ac` float DEFAULT NULL,
  `vphase_an` float DEFAULT NULL,
  `vphase_bn` float DEFAULT NULL,
  `vphase_cn` float DEFAULT NULL,
  `cphase_a` float DEFAULT NULL,
  `cphase_b` float DEFAULT NULL,
  `cphase_c` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `meter_id` (`meter_id`),
  CONSTRAINT `data_ibfk_1` FOREIGN KEY (`meter_id`) REFERENCES `meters` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
CREATE TABLE `stories` (
  `id` int(11) NOT NULL auto_increment,
  `user_id` int(11) DEFAULT NULL,
  `name` char(64) DEFAULT NULL,
  `description` text,
  `public` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `stories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
CREATE TABLE `blocks` (
  `id` int(11) NOT NULL auto_increment,
  `date_start` datetime DEFAULT NULL,
  `date_end` datetime DEFAULT NULL,
  `date_range` char(64) DEFAULT NULL,
  `graph_type` tinyint(4) DEFAULT NULL,
  `media` char(255) DEFAULT NULL,
  `descr` text,
  `story_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `story_id` (`story_id`),
  CONSTRAINT `blocks_ibfk_1` FOREIGN KEY (`story_id`) REFERENCES `stories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
CREATE TABLE `block_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `block_id` int(11) DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  `point` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `block_id` (`block_id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `block_groups_ibfk_1` FOREIGN KEY (`block_id`) REFERENCES `blocks` (`id`),
  CONSTRAINT `block_groups_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `meter_groups` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;