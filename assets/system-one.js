(function (global) {
  'use strict';

  function endpoint() {
    var meta = document.querySelector('meta[name="gan-lms-system-one-endpoint"]');
    var value = meta ? String(meta.getAttribute('content') || '').trim() : '';
    return value ? value.replace(/\/+$/, '') : '';
  }

  function asBooleanProbability(answer) {
    if (!answer || typeof answer !== 'object') return 0;
    var value = Number(answer.noul);
    return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
  }

  async function classifyLearningEvent(text, context) {
    var baseUrl = endpoint();
    var input = String(text || '').trim();
    if (!baseUrl || !input) return null;

    var controller = new AbortController();
    var timeoutMs = Number((context && context.timeoutMs) || 1200);
    var timer = setTimeout(function () { controller.abort(); }, Math.max(100, timeoutMs));

    try {
      var response = await fetch(baseUrl + '/v1/systemone', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          state: {
            learning_event: input.slice(0, 10000),
            course_id: context && context.courseId ? String(context.courseId) : null,
            lesson_id: context && context.lessonId ? String(context.lessonId) : null,
            learner_stage: context && context.learnerStage ? String(context.learnerStage) : null,
            policy: {
              advisory_only: true,
              existing_course_progress_and_instructor_rules_remain_authoritative: true,
              no_automatic_grading_or_certification: true,
              no_high_stakes_student_decision: true
            }
          },
          questions: {
            content_type: {
              type: 'choice',
              instructions: 'Which learning-content family best matches this input?',
              criteria: {
                explanation: 'Explanatory lesson or concept content',
                worked_example: 'Worked example, demonstration or solved problem',
                practice: 'Practice exercise or low-stakes activity',
                assessment: 'Quiz, test or assessment-oriented content',
                project: 'Project, assignment or applied task',
                discussion: 'Discussion, reflection or collaborative prompt',
                support_request: 'Learner question, confusion, access or support request',
                other: 'Another learning-content type'
              }
            },
            difficulty: {
              type: 'score',
              instructions: 'How difficult is this learning item for the stated learner context?',
              criteria: ['introductory', 'foundational', 'intermediate', 'advanced']
            },
            lesson_route: {
              type: 'choice',
              instructions: 'Which next learning route is most appropriate for review?',
              criteria: {
                continue: 'Continue the current learning path',
                prerequisite_review: 'Review prerequisite concepts first',
                worked_example: 'Show a worked example before continuing',
                guided_practice: 'Use guided practice before independent work',
                instructor_review: 'Ask an instructor or qualified reviewer to intervene',
                accessibility_support: 'Provide accessibility or alternative-format support'
              }
            },
            intervention_needed: {
              type: 'noul',
              instructions: 'Does the learner context indicate that instructor or support intervention may be useful?'
            },
            needs_tools: {
              type: 'noul',
              instructions: 'Does this learning activity require tools, files, code execution, external resources or another application?'
            },
            non_english: {
              type: 'noul',
              instructions: 'Is the primary learning input written in a language other than English?'
            }
          }
        })
      });

      if (!response.ok) return null;
      var body = await response.json();
      if (!body || !body.answers || typeof body.answers !== 'object') return null;

      return {
        provider: 'laya',
        advisory_only: true,
        answers: body.answers,
        routing: body.routing || null,
        usage: body.usage || null,
        intervention_probability: asBooleanProbability(body.answers.intervention_needed)
      };
    } catch (_) {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  var api = Object.freeze({
    enabled: function () { return Boolean(endpoint()); },
    classifyLearningEvent: classifyLearningEvent
  });

  global.GANLmsSystemOne = api;

  document.addEventListener('gan:lms-classify', function (event) {
    var detail = event && event.detail ? event.detail : {};
    classifyLearningEvent(detail.text, detail.context || {}).then(function (decision) {
      document.dispatchEvent(new CustomEvent('gan:lms-system-one-decision', {
        detail: {
          requestId: detail.requestId || null,
          decision: decision
        }
      }));
    });
  });
})(window);
