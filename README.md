# GAN-TECH LMS
Learning Management System

## Description
GAN-TECH LMS is a learning management system designed for educational institutions and businesses.

## Features
* Student management
* Instructor dashboard
* Course management
* Certification
* Communication tools
* Advanced analytics

## Demo
[View demo](https://GAN-007.github.io/GAN-TECH-LMS/)


## Laya / System-One decision layer

The static LMS demo now exposes an optional browser decision API at
`window.GANLmsSystemOne`. When a compatible `/v1/systemone` endpoint is
configured in the `gan-lms-system-one-endpoint` meta tag, learning events can
be classified by content type, difficulty, lesson route, language/tool needs and
possible intervention need.

The endpoint is blank by default, so existing behavior is unchanged. Decisions
are advisory only and cannot automatically grade learners, award certification,
change course progress, or replace instructor rules.

Integrations can also dispatch `gan:lms-classify` and listen for
`gan:lms-system-one-decision` without modifying the current page journeys.
